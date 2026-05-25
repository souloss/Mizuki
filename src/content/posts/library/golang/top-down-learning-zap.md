---
title: 自顶向下学习 zap 日志库
published: 2026-03-09
description: 自顶向下阅读 zap 日志库源码——从 Logger 接口设计到 Core 实现，解析 zap 高性能日志的核心机制与最佳实践。
tags:
  - Golang
  - 日志
  - Zap
  - 源码阅读
  - 库
category: golang
slug: top-down-learning-zap
---

Zap 是由优步（Uber）开发和维护的一款 Golang 开源日志库，它的特点包括：

- **高性能**：以无反射、零分配为宗旨进行优化，在拥有基本功能的前提下实现最佳的性能。
- **结构化**：支持通过编码器将一条日志记录结构化为 JSON，方便其它组件采集和分析。
- **可扩展**：支持从编码器（例如 BSON）、接收器（例如 Kafka）、多路输出（同时输出到文件和流）等方向进行扩展。

在使用 Zap 之前，可以回顾一下一个日志包一般会提供什么功能：

- **全局实例和多实例**：使用全局实例实现开箱即用，也支持创建多个不同的日志记录器，实现互不影响的记录与输出等行为。
- **日志配置**：可以通过配置实现个性化的日志记录器，比如日志条目格式化、写入目标等。
  - **分级记录和输出**：通过日志记录器（Logger）提供的 INFO、DEBUG 等接口记录不同级别的日志，根据配置中的日志级别决定是否输出该条日志。
  - **日志格式化器**：将日志格式化为特定的格式，方便人类/程序读取。
  - **日志输出器**：负责将日志输出到一个或多个指定位置。
  - **日志轮转**：使日志输出的文件大小和数量保持一定，避免爆磁盘。

从以上可以发现，日志记录常见的用例就是：

创建日志配置 → 创建日志记录器 → 记录指定级别和消息的日志 → 输出过滤 → 日志消息格式化 → 日志输出 → 判断是否需要轮转

现在，可以先自顶向下分析下 Zap 的组成，看它是否支持这些能力，如果支持的话，又是怎样实现这些能力的。

## 从 Logger 的创建开始

怎样使用 Zap 创建一个日志记录器？可以从 `logger.go` 入手，创建一个用于记录的 Logger 有如下几种方式：

```go
// 用于开发环境的预设日志记录器工厂
func NewDevelopment(options ...Option) *Logger
// 用于生产环境的预设日志记录器工厂
func NewProduction(options ...Option) *Logger
// 用于测试环境的预设日志记录器工厂
func NewExample(options ...Option) *Logger

// 自定义 zapcore 的日志记录器
func New(core zapcore.Core, options ...Option) *Logger

// 接口更加简单的日志记录器，可以通过上面的日志记录器预设工厂函数创建后转换获取
func Sugar() *SugaredLogger
```

从 `logger.go` 和 `sugar.go` 中可以对比得知，Logger 和 SugaredLogger 的接口区别是：

- **Logger**：仅支持字符串消息，携带上下文信息（字段）时需要指定类型。
- **SugaredLogger**：支持字符串、字符串模板，携带上下文信息时不需要指定类型。

从上面几个预设好的日志记录器工厂函数中，可以发现它们实际上都是调用 `New(core zapcore.Core, options ...Option) *Logger` 创建出的实例。`NewDevelopment` 和 `NewProduction` 进行了一层封装，通过 `Config` 记录配置选项，底层还是 `New` 函数。

可以先从 `Config` 开始，观察一个日志记录器拥有哪些配置项，这些配置项又是怎样转化为日志记录器的内部状态的：

```go
// 日志记录器配置结构体
type Config struct {
	// Level is the minimum enabled logging level. Note that this is a dynamic
	// level, so calling Config.Level.SetLevel will atomically change the log
	// level of all loggers descended from this config.
	Level AtomicLevel `json:"level" yaml:"level"`
	// Development puts the logger in development mode, which changes the
	// behavior of DPanicLevel and takes stacktraces more liberally.
	Development bool `json:"development" yaml:"development"`
	// DisableCaller stops annotating logs with the calling function's file
	// name and line number. By default, all logs are annotated.
	DisableCaller bool `json:"disableCaller" yaml:"disableCaller"`
	// DisableStacktrace completely disables automatic stacktrace capturing. By
	// default, stacktraces are captured for WarnLevel and above logs in
	// development and ErrorLevel and above in production.
	DisableStacktrace bool `json:"disableStacktrace" yaml:"disableStacktrace"`
	// Sampling sets a sampling policy. A nil SamplingConfig disables sampling.
	Sampling *SamplingConfig `json:"sampling" yaml:"sampling"`
	// Encoding sets the logger's encoding. Valid values are "json" and
	// "console", as well as any third-party encodings registered via
	// RegisterEncoder.
	Encoding string `json:"encoding" yaml:"encoding"`
	// EncoderConfig sets options for the chosen encoder. See
	// zapcore.EncoderConfig for details.
	EncoderConfig zapcore.EncoderConfig `json:"encoderConfig" yaml:"encoderConfig"`
	// OutputPaths is a list of URLs or file paths to write logging output to.
	// See Open for details.
	OutputPaths []string `json:"outputPaths" yaml:"outputPaths"`
	// ErrorOutputPaths is a list of URLs to write internal logger errors to.
	// The default is standard error.
	//
	// Note that this setting only affects internal errors; for sample code that
	// sends error-level logs to a different location from info- and debug-level
	// logs, see the package-level AdvancedConfiguration example.
	ErrorOutputPaths []string `json:"errorOutputPaths" yaml:"errorOutputPaths"`
	// InitialFields is a collection of fields to add to the root logger.
	InitialFields map[string]interface{} `json:"initialFields" yaml:"initialFields"`
}

// 原子级别结构体
type AtomicLevel struct {
	l *atomic.Int32
}

// 编码器配置结构体，这是 zapcore 包中的结构
// An EncoderConfig allows users to configure the concrete encoders supplied by
// zapcore.
type EncoderConfig struct {
	// Set the keys used for each log entry. If any key is empty, that portion
	// of the entry is omitted.
	MessageKey     string `json:"messageKey" yaml:"messageKey"`
	LevelKey       string `json:"levelKey" yaml:"levelKey"`
	TimeKey        string `json:"timeKey" yaml:"timeKey"`
	NameKey        string `json:"nameKey" yaml:"nameKey"`
	CallerKey      string `json:"callerKey" yaml:"callerKey"`
	FunctionKey    string `json:"functionKey" yaml:"functionKey"`
	StacktraceKey  string `json:"stacktraceKey" yaml:"stacktraceKey"`
	SkipLineEnding bool   `json:"skipLineEnding" yaml:"skipLineEnding"`
	LineEnding     string `json:"lineEnding" yaml:"lineEnding"`
	// Configure the primitive representations of common complex types. For
	// example, some users may want all time.Times serialized as floating-point
	// seconds since epoch, while others may prefer ISO8601 strings.
    // type LevelEncoder func(Level, PrimitiveArrayEncoder)
	EncodeLevel    LevelEncoder    `json:"levelEncoder" yaml:"levelEncoder"`
    // type TimeEncoder func(time.Time, PrimitiveArrayEncoder)
	EncodeTime     TimeEncoder     `json:"timeEncoder" yaml:"timeEncoder"`
	// type DurationEncoder func(time.Duration, PrimitiveArrayEncoder)
    EncodeDuration DurationEncoder `json:"durationEncoder" yaml:"durationEncoder"`
    // type CallerEncoder func(EntryCaller, PrimitiveArrayEncoder)
	EncodeCaller   CallerEncoder   `json:"callerEncoder" yaml:"callerEncoder"`
	// Unlike the other primitive type encoders, EncodeName is optional. The
	// zero value falls back to FullNameEncoder.
    // type NameEncoder func(string, PrimitiveArrayEncoder)
	EncodeName NameEncoder `json:"nameEncoder" yaml:"nameEncoder"`
	// Configure the encoder for interface{} type objects.
	// If not provided, objects are encoded using json.Encoder
	NewReflectedEncoder func(io.Writer) ReflectedEncoder `json:"-" yaml:"-"`
	// Configures the field separator used by the console encoder. Defaults
	// to tab.
	ConsoleSeparator string `json:"consoleSeparator" yaml:"consoleSeparator"`
}

// 采样结构体
// SamplingConfig sets a sampling strategy for the logger. Sampling caps the
// global CPU and I/O load that logging puts on your process while attempting
// to preserve a representative subset of your logs.
//
// If specified, the Sampler will invoke the Hook after each decision.
//
// Values configured here are per-second. See zapcore.NewSamplerWithOptions for
// details.
type SamplingConfig struct {
	Initial    int                                           `json:"initial" yaml:"initial"`
	Thereafter int                                           `json:"thereafter" yaml:"thereafter"`
	Hook       func(zapcore.Entry, zapcore.SamplingDecision) `json:"-" yaml:"-"`
}
```

从以上可以看到，创建一个日志记录器的配置项可以配置日志级别、开发模式、调用者跟踪和堆栈跟踪、采样器、编码器、标准和错误输出的位置、初始化的公共字段等。这些配置项一部分用于构造 `Encoder`，一部分用于构造 `WriteSyncer`，其它部分则用于构造 `Option`，最后调用 `zap.New` 构造出日志记录器。

在大概了解了一个日志记录器存在哪些状态之后，接下来可以进一步分析日志记录器是怎样创建出来的：

```go
// zapcore 包中的接口
type Core interface {
	// 日志等级检测接口
	LevelEnabler

	// 写入日志自定义字段
	// With adds structured context to the Core.
	With([]Field) Core

	// 检测日志是否应该被记录
	// 如果日志需要记录，就将参数 Entry 添加到返回值 CheckedEntry
	// Check determines whether the supplied Entry should be logged (using the
	// embedded LevelEnabler and possibly some extra logic). If the entry
	// should be logged, the Core adds itself to the CheckedEntry and returns
	// the result.
	//
	// Callers must use Check before calling Write.
	Check(Entry, *CheckedEntry) *CheckedEntry

	// 写入日志
	// Write serializes the Entry and any Fields supplied at the log site and
	// writes them to their destination.
	//
	// If called, Write should always log the Entry and Fields; it should not
	// replicate the logic of Check.
	Write(Entry, []Field) error

	// 刷出缓冲区的日志信息
	// Sync flushes buffered logs (if any).
	Sync() error
}

func New(core zapcore.Core, options ...Option) *Logger {
	if core == nil {
		return NewNop()
	}
	log := &Logger{
		core:        core,
		// 日志记录器自己本身出错时，会往这里输出
		errorOutput: zapcore.Lock(os.Stderr),
		// 输出堆栈的日志级别
		addStack:    zapcore.FatalLevel + 1,
		// 时间接口，主要用于获取时间戳和设置定时器
		clock:       zapcore.DefaultClock,
	}
return log.WithOptions(options...)
}
```

从上面可以看出，使用的 `Logger` 实际上是 `zapcore.Core` 的一层封装。`zapcore.Core` 提供日志操作的底层最小接口，并且每种接口都提供了默认实现（参考 Encoder）。

## zap.Logger 是怎样打印一条日志的

在上一节，我们了解了怎样创建一个 `zap.Logger`，接下来可以从 `Logger.Info` 函数开始阅读，观察日志记录器是怎样打印一条日志的：

```go
func (log *Logger) Info(msg string, fields ...Field) {
	// 检查是否需要写入日志
	if ce := log.check(InfoLevel, msg); ce != nil {
		// 写入日志
		ce.Write(fields...)
	}
}

func (log *Logger) check(lvl zapcore.Level, msg string) *zapcore.CheckedEntry {

	const callerSkipOffset = 2
	// 级别对部署直接返回 nil，不打印日志
	if lvl < zapcore.DPanicLevel && !log.core.Enabled(lvl) {
		return nil
	}

	// 创建一条日志消息实体
	ent := zapcore.Entry{
		LoggerName: log.name,
		Time:       log.clock.Now(),
		Level:      lvl,
		Message:    msg,
	}
	// 调用底层的 Check 获取检查过的日志消息实体
	ce := log.core.Check(ent, nil)
	willWrite := ce != nil

	// 根据当前级别判断是否需要 panic 和 fatal(os.Exit(1))
	switch ent.Level {
	case zapcore.PanicLevel:
		ce = ce.Should(ent, zapcore.WriteThenPanic)
	case zapcore.FatalLevel:
		onFatal := log.onFatal
		// nil or WriteThenNoop will lead to continued execution after
		// a Fatal log entry, which is unexpected. For example,
		//
		//   f, err := os.Open(..)
		//   if err != nil {
		//     log.Fatal("cannot open", zap.Error(err))
		//   }
		//   fmt.Println(f.Name())
		//
		// The f.Name() will panic if we continue execution after the
		// log.Fatal.
		if onFatal == nil || onFatal == zapcore.WriteThenNoop {
			onFatal = zapcore.WriteThenFatal
		}
		ce = ce.After(ent, onFatal)
	case zapcore.DPanicLevel:
		if log.development {
			ce = ce.Should(ent, zapcore.WriteThenPanic)
		}
	}

	// 如果不需要写入，也就意味着 ce==nil，info 中就不会调用 Write
	if !willWrite {
		return ce
	}

	// 将 Logger 的 WriteSyncer 赋值给 CheckedEntry
	ce.ErrorOutput = log.errorOutput

	// 根据配置决定是否需要堆栈和调用者跟踪，不需要则直接返回 CheckedEntry
	addStack := log.addStack.Enabled(ce.Level)
	if !log.addCaller && !addStack {
		return ce
	}

	// 否则捕获相关信息，赋值给 CheckedEntry
	stackDepth := stacktraceFirst
	if addStack {
		stackDepth = stacktraceFull
	}
	stack := captureStacktrace(log.callerSkip+callerSkipOffset, stackDepth)
	defer stack.Free()

	if stack.Count() == 0 {
		if log.addCaller {
			fmt.Fprintf(log.errorOutput, "%v Logger.check error: failed to get caller\n", ent.Time.UTC())
			log.errorOutput.Sync()
		}
		return ce
	}

	frame, more := stack.Next()

	if log.addCaller {
		ce.Caller = zapcore.EntryCaller{
			Defined:  frame.PC != 0,
			PC:       frame.PC,
			File:     frame.File,
			Line:     frame.Line,
			Function: frame.Function,
		}
	}

	if addStack {
		buffer := bufferpool.Get()
		defer buffer.Free()

		stackfmt := newStackFormatter(buffer)

		// We've already extracted the first frame, so format that
		// separately and defer to stackfmt for the rest.
		stackfmt.FormatFrame(frame)
		if more {
			stackfmt.FormatStack(stack)
		}
		ce.Stack = buffer.String()
	}

	// 返回 CheckedEntry
	return ce
}

// Write writes the entry to the stored Cores, returns any errors, and returns
// the CheckedEntry reference to a pool for immediate re-use. Finally, it
// executes any required CheckWriteAction.
func (ce *CheckedEntry) Write(fields ...Field) {
	if ce == nil {
		return
	}

	if ce.dirty {
		if ce.ErrorOutput != nil {
			// Make a best effort to detect unsafe re-use of this CheckedEntry.
			// If the entry is dirty, log an internal error; because the
			// CheckedEntry is being used after it was returned to the pool,
			// the message may be an amalgamation from multiple call sites.
			fmt.Fprintf(ce.ErrorOutput, "%v Unsafe CheckedEntry re-use near Entry %+v.\n", ce.Time, ce.Entry)
			ce.ErrorOutput.Sync()
		}
		return
	}
	ce.dirty = true

	var err error
	// 遍历 CheckedEntry 中的所有 core，将 Entry 作为参数调用它们的 Write 方法
	for i := range ce.cores {
		err = multierr.Append(err, ce.cores[i].Write(ce.Entry, fields))
	}
	if err != nil && ce.ErrorOutput != nil {
		fmt.Fprintf(ce.ErrorOutput, "%v write error: %v\n", ce.Time, err)
		ce.ErrorOutput.Sync()
	}

	// 调用 hook
	hook := ce.after
	if hook != nil {
		hook.OnWrite(ce, fields)
	}

	// 将 CheckedEntry 存入 sync.Pool，以便下次从池中获取使用
	putCheckedEntry(ce)
}

// 默认的 zapcore.Core 实现的 Write 方法
func (c *ioCore) Write(ent Entry, fields []Field) error {
	// 根据实体和字段获取编码后的 buffer
	buf, err := c.enc.EncodeEntry(ent, fields)
	if err != nil {
		return err
	}
	// 调用 WriteSyncer 的 Write 方法写入 Bytes
	_, err = c.out.Write(buf.Bytes())
	buf.Free()
	if err != nil {
		return err
	}
	// 若日志级别大于错误级别则直接同步写入操作
	if ent.Level > ErrorLevel {
		// Since we may be crashing the program, sync the output. Ignore Sync
		// errors, pending a clean solution to issue #370.
		c.Sync()
	}
	return nil
}
```

阅读以上两个关键方法，可以概括出日志记录器打印消息的主要流程：

1. 创建一个 Entry 结构体，这里面包含了一条日志最基本的信息。
2. 用上面的 Entry 作为参数，调用 `logger.core.Check` 方法检查该条日志是否需要打印。如果不需要打印直接返回 nil，否则返回 CheckedEntry。CheckedEntry 对比 Entry 新增了错误输出、脏写入检测、写入后钩子以及最小日志接口 Core 的功能。
3. 根据日志级别判断是否需要添加 Panic 或 Fatal 钩子，以便于写入日志后进行对应的动作，将钩子挂在 CheckedEntry 上。
4. 将 `Logger.errorOutput` 挂在 CheckedEntry 上，方便输出错误信息。
5. 若 `Logger.addStack` 返回 true，并且开启了 `Logger.addCaller` 则捕获堆栈并赋值给 CheckedEntry。
6. 遍历 `CheckedEntry.cores` 属性中所有的 `zapcore.Core`，以 `CheckedEntry.Entry` 和 fields 为参数调用它的 Write 方法。
7. 调用 `CheckedEntry.after` 中的 Hook 方法，这里主要用来执行退出或者 Panic 操作，详见 `entry.go:CheckWriteAction` 类型以及方法。
8. 将 CheckedEntry 归还到 Pool 中。

## zap.Logger 的 Field

已知，Zap 是一个结构化的日志记录器。在一条日志中，可以插入 Field 携带一些额外信息。从上面的章节，我们了解了一条日志写入的大概流程，这一节将探寻 `Write` 方法中的 `buf, err := c.enc.EncodeEntry(ent, fields)`，也就是 Zap 是如何将字段编码到日志中的这一流程。首先可以从源码查看 Zap 是怎样设计 Field 的：

```go
//zap/zapcore/field.go
type FieldType uint8

const (
	// UnknownType is the default field type. Attempting to add it to an encoder will panic.
	UnknownType FieldType = iota
	ArrayMarshalerType
	ObjectMarshalerType
	BinaryType
	BoolType
	...
)

type Field struct {
	Key       string
	Type      FieldType
	Integer   int64
	String    string
	Interface interface{}
}

func (f Field) AddTo(enc ObjectEncoder) {
	var err error

	switch f.Type {
	case ArrayMarshalerType:
		err = enc.AddArray(f.Key, f.Interface.(ArrayMarshaler))
	case ObjectMarshalerType:
		err = enc.AddObject(f.Key, f.Interface.(ObjectMarshaler))
	....
	default:
		panic(fmt.Sprintf("unknown field type: %v", f))
	}
		if err != nil {
		enc.AddString(fmt.Sprintf("%sError", f.Key), err.Error())
	}
}

func addFields(enc ObjectEncoder, fields []Field) {
	for i := range fields {
		fields[i].AddTo(enc)
	}
}

// zap/filed.go
// Uint64 constructs a field with the given key and value.
func Uint64(key string, val uint64) Field {
	return Field{Key: key, Type: zapcore.Uint64Type, Integer: int64(val)}
}

// Uint64p constructs a field that carries a *uint64. The returned Field will safely
// and explicitly represent `nil` when appropriate.
func Uint64p(key string, val *uint64) Field {
	if val == nil {
		return nilField(key)
	}
	return Uint64(key, *val)
}

.....
```

在通过类似如下代码写一条日志时：

```go
logger.Info("failed to fetch URL",
  // Structured context as strongly typed Field values.
  zap.String("url", url),
  zap.Int("attempt", 3),
  zap.Duration("backoff", time.Second),
)
```

首先会构造一个 CheckedEntry，然后 Write 时，每个 Core 都会通过 `EncodeEntry` 将日志实体 Entry 和字段 Field 编码成具体的字符串缓冲 Buffer。因为每个字段类型都是确定的，所以编码器无需反射，数值和字符串类型直接能获取到值，其它复杂类型通过低成本的类型断言获取到值，再通过简单的字符串拼接，即可完成完整日志条目字符串的拼接。

## Option 设计模式

在 `zap/options.go` 中，能看到很多返回值类型为 Option 的函数，在创建 Logger 时，通过传入这些选项就能很轻易地在一定程度上更改日志记录器的行为。通过 Option 接口中的函数签名 `apply(*Logger)` 很容易得知 Option 的作用实际上就是更改 Logger 的某些属性，使之更容易地实现某些能力。下面我将分析常见的几种 Option 实现，学习它们是怎样工作的。首先从这个接口以及该函数的使用开始：

```go
// zap/options.go
type Option interface {
	apply(*Logger)
}

// zap/logger.go
func (log *Logger) WithOptions(opts ...Option) *Logger {
	c := log.clone()
	for _, opt := range opts {
		opt.apply(c)
	}
	return c
}
```

从上可以看到，这其实是一种用于配置实例的设计模式，它会传入当前实例或它的拷贝，然后调用 `apply` 函数修改它的属性，最后再返回这个实例。

## Hook 设计模式

在上文中有提到，一条日志消息在打印后会调用 Hook 函数进行一些后置操作。但这里的 Hook 与 `ce.after` 的 Hook 略有不同。这里的 Hook 是通过 `func Hooks(hooks ...func(zapcore.Entry) error) Option` 函数进行创建，以 Option 接口的形式存在的。可以从下面这个 Demo 开始：

```go
func TestDevelopLogger(t *testing.T) {
	logger, _ := zap.NewDevelopment(zap.Hooks(func(entry zapcore.Entry) error {
		fmt.Println("msg A:", entry.Message)
		return nil
	}), zap.Hooks(func(entry zapcore.Entry) error {
		fmt.Println("msg B:", entry.Message)
		return nil
	}))
	logger.Info("hello world")
}

// 它会打印如下消息：
// 2024-11-02T12:38:54.770+0800	INFO	test/test_logger.go:168	hello world
// msg A: hello world
// msg B: hello world
```

通过阅读源码可知：

```go
// zapcore/hook.go
// 通过 Option 设计模式，返回的 Logger 中的 core 会被 zapcore.RegisterHooks 进行一层封装
func Hooks(hooks ...func(zapcore.Entry) error) Option {
	return optionFunc(func(log *Logger) {
		log.core = zapcore.RegisterHooks(log.core, hooks...)
	})
}

// 注册 Hook 实际上就是将原来的 core 包装为 hooked Core
func RegisterHooks(core Core, hooks ...func(Entry) error) Core {
	funcs := append([]func(Entry) error{}, hooks...)
	return &hooked{
		Core:  core,
		funcs: funcs,
	}
}

// zapcore/hook.go
type hooked struct {
	Core
	funcs []func(Entry) error
}
// 确保 hooked 实现了 Core 和 leveledEnabler 接口
var (
	_ Core           = (*hooked)(nil)
	_ leveledEnabler = (*hooked)(nil)
)

// 调用内部的 Core.Check，若通过则将这个 Core 添加到 *CheckedEntry 中
func (h *hooked) Check(ent Entry, ce *CheckedEntry) *CheckedEntry {
	// Let the wrapped Core decide whether to log this message or not. This
	// also gives the downstream a chance to register itself directly with the
	// CheckedEntry.
	if downstream := h.Core.Check(ent, ce); downstream != nil {
		return downstream.AddCore(ent, h)
	}
	return ce
}

// 直接遍历 funcs 进行调用，将错误拼接起来进行返回
func (h *hooked) Write(ent Entry, _ []Field) error {
	// Since our downstream had a chance to register itself directly with the
	// CheckedMessage, we don't need to call it here.
	var err error
	for i := range h.funcs {
		err = multierr.Append(err, h.funcs[i](ent))
	}
	return err
}
```

所以上面的 demo 经过两次 Hook 包装后，返回的 Logger 成为了下面的样子：

```go
Logger:{
	// 后包装的在外面
	core: hooked{
		// 先包装的在里面
		core: hooked:{
			core: iocore{...}
			funcs: []func(entry zapcore.Entry){ print("msg A") }
		}
		funcs: []func(entry zapcore.Entry){ print("msg B") }
	}
	...
}
```

在之前我们已经了解到了打印一条日志会先调用检查，检查通过则会将 Core 添加到 `*CheckedEntry` 中，然后写入时日志消息实体会调用 Core 的 Write 方法进行写入。从上面可以得知调用 hooked 的 Check 方法时，它会调用下游的 Core 进行 Check，若检查不为空，则将自己作为 Core 添加到 `*CheckedEntry` 中。

也就是说上面那个 Demo 打印日志时，会有三个 Core：第一个 Core 是打印日志记录的 ioCore，后面两个 Core 分别是打印 msg A 的 hooked core 和打印 msg B 的 hooked core。

## zap.Logger 的扩展机制

已知 Zap 的核心接口是 `zapcore.Core`，并且它的默认实现 `zapcore.ioCore` 内部有三个接口，这些都是可扩展的点。下面我将从常用的几个扩展点开始进行介绍。

### Encoder

Encoder 即编码器，是一种用于将日志记录编码为特定格式的工具。zapcore 包中自带三种编码器：

- **jsonEncoder**：Zap 中最核心的编码器，为了高性能没有使用反射，借助强类型的 Field 进行编码。
- **consoleEncoder**：基于 jsonEncoder 进行了一层封装，更改了日志的打印格式。
- **memoryEncoder**：用于测试的编码器，没有实现 `Clone` 和 `EncodeEntry` 方法，不能直接使用。

首先，我们先看看 Encoder 的定义：

```go
type Encoder interface {
	ObjectEncoder

	// Clone copies the encoder, ensuring that adding fields to the copy doesn't
	// affect the original.
	Clone() Encoder

	// EncodeEntry encodes an entry and fields, along with any accumulated
	// context, into a byte buffer and returns it. Any fields that are empty,
	// including fields on the `Entry` type, should be omitted.
	EncodeEntry(Entry, []Field) (*buffer.Buffer, error)
}

type ObjectEncoder interface {
	// Logging-specific marshalers.
	AddArray(key string, marshaler ArrayMarshaler) error
	AddObject(key string, marshaler ObjectMarshaler) error

	// Built-in types.
	AddBinary(key string, value []byte)     // for arbitrary bytes
	AddByteString(key string, value []byte) // for UTF-8 encoded bytes
	AddBool(key string, value bool)
	AddComplex128(key string, value complex128)
	AddComplex64(key string, value complex64)
	AddDuration(key string, value time.Duration)
	AddFloat64(key string, value float64)
	AddFloat32(key string, value float32)
	AddInt(key string, value int)
	AddInt64(key string, value int64)
	AddInt32(key string, value int32)
	AddInt16(key string, value int16)
	AddInt8(key string, value int8)
	AddString(key, value string)
	AddTime(key string, value time.Time)
	AddUint(key string, value uint)
	AddUint64(key string, value uint64)
	AddUint32(key string, value uint32)
	AddUint16(key string, value uint16)
	AddUint8(key string, value uint8)
	AddUintptr(key string, value uintptr)

	// AddReflected uses reflection to serialize arbitrary objects, so it can be
	// slow and allocation-heavy.
	AddReflected(key string, value interface{}) error
	// OpenNamespace opens an isolated namespace where all subsequent fields will
	// be added. Applications can use namespaces to prevent key collisions when
	// injecting loggers into sub-components or third-party libraries.
	OpenNamespace(key string)
}
```

从上面能了解一个 Encoder 提供了哪些接口，能看到其中最核心的就是 `EncodeEntry(Entry, []Field) (*buffer.Buffer, error)`，它在 ioCore 的 Write 方法中的第一行就会被调用。在看代码之前，可以先写一个示例，直观地感受一下这两种编码器的异同：

```go
func TestEncoderLogger(t *testing.T) {
	json_logger := zap.New(zapcore.NewCore(
		zapcore.NewJSONEncoder(zap.NewDevelopmentEncoderConfig()),
		zapcore.AddSync(os.Stdout),
		zapcore.DebugLevel,
	))

	console_logger := zap.New(zapcore.NewCore(
		// 编码器配置
		zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig()),
		zapcore.AddSync(os.Stdout),
		zapcore.DebugLevel,
	))

	json_logger.Info("not have field")
	json_logger.Info("have many field", zap.String("key1", "val1"), zap.Int("key2", 2))

	console_logger.Info("not have field")
	console_logger.Info("have many field", zap.String("key1", "val1"), zap.Int("key2", 2))
}

// --- output
// {"L":"INFO","T":"2022-06-27T01:08:10.119+0800","M":"not have field"}
// {"L":"INFO","T":"2022-06-27T01:08:10.119+0800","M":"have many field","key1":"val1","key2":2}
// 2022-06-27T01:08:10.119+0800	INFO	not have field
// 2022-06-27T01:08:10.119+0800	INFO	have many field	{"key1": "val1", "key2": 2}
```

接下来，可以从 jsonEncoder 的 EncodeEntry 方法开始：

```go
func (enc *jsonEncoder) EncodeEntry(ent Entry, fields []Field) (*buffer.Buffer, error) {
	final := enc.clone()
	final.buf.AppendByte('{')

	if final.LevelKey != "" && final.EncodeLevel != nil {
		final.addKey(final.LevelKey)
		cur := final.buf.Len()
		final.EncodeLevel(ent.Level, final)
		if cur == final.buf.Len() {
			// User-supplied EncodeLevel was a no-op. Fall back to strings to keep
			// output JSON valid.
			final.AppendString(ent.Level.String())
		}
	}
	if final.TimeKey != "" {
		final.AddTime(final.TimeKey, ent.Time)
	}
	if ent.LoggerName != "" && final.NameKey != "" {
		final.addKey(final.NameKey)
		cur := final.buf.Len()
		nameEncoder := final.EncodeName

		// if no name encoder provided, fall back to FullNameEncoder for backwards
		// compatibility
		if nameEncoder == nil {
			nameEncoder = FullNameEncoder
		}

		nameEncoder(ent.LoggerName, final)
		if cur == final.buf.Len() {
			// User-supplied EncodeName was a no-op. Fall back to strings to
			// keep output JSON valid.
			final.AppendString(ent.LoggerName)
		}
	}
	if ent.Caller.Defined {
		if final.CallerKey != "" {
			final.addKey(final.CallerKey)
			cur := final.buf.Len()
			final.EncodeCaller(ent.Caller, final)
			if cur == final.buf.Len() {
				// User-supplied EncodeCaller was a no-op. Fall back to strings to
				// keep output JSON valid.
				final.AppendString(ent.Caller.String())
			}
		}
		if final.FunctionKey != "" {
			final.addKey(final.FunctionKey)
			final.AppendString(ent.Caller.Function)
		}
	}
	if final.MessageKey != "" {
		final.addKey(enc.MessageKey)
		final.AppendString(ent.Message)
	}
	if enc.buf.Len() > 0 {
		final.addElementSeparator()
		final.buf.Write(enc.buf.Bytes())
	}
	addFields(final, fields)
	final.closeOpenNamespaces()
	if ent.Stack != "" && final.StacktraceKey != "" {
		final.AddString(final.StacktraceKey, ent.Stack)
	}
	final.buf.AppendByte('}')
	final.buf.AppendString(final.LineEnding)

	ret := final.buf
	putJSONEncoder(final)
	return ret, nil
}
```

上面的代码看似很长，实际上的逻辑却很简单：

1. 首先调用 `enc.clone()` 方法，从对象池中获取零值对象 `final`，再将当前编码器的数据赋值给它；
2. 根据 EncoderConfig 日志内容往 `final.buf` 中写值；
3. 从 `final` 中获取 `buf` 作为返回值 `ret`；
4. 通过 `putJSONEncoder()` 方法将 `final` 对象重置并还给对象池；
5. 返回 ret。

这里唯一需要注意的就是，为了高性能，减少对象的内存分配，使用了对象池化的技术。从上面可以看到，为了实现 jsonEncoder 的复用，它采用了如下操作：

- jsonEncoder 本身只存编码器的公共数据，打印日志时的临时字段采用 clone 的 jsonEncoder 进行操作。
- clone 编码器的过程实际上只是从对象池获取已分配好的实例，再进行值的复制而已，使用完后会通过 `putJSONEncoder()` 清空属性还给对象池。
- clone 过程中，其中的 buffer 属性也是从对象池中获取的，在获取时它会通过 `Reset()` 进行内容的重置。

### WriteSyncer

WriteSyncer 的定义更加简单，它实际上就是包装 `io.Writer` 之后新增了一个 `Sync()` 方法而已。

```go
type WriteSyncer interface {
	io.Writer
	Sync() error
}

// AddSync converts an io.Writer to a WriteSyncer. It attempts to be
// intelligent: if the concrete type of the io.Writer implements WriteSyncer,
// we'll use the existing Sync method. If it doesn't, we'll add a no-op Sync.
func AddSync(w io.Writer) WriteSyncer {
	switch w := w.(type) {
	case WriteSyncer:
		return w
	default:
		return writerWrapper{w}
	}
}

type writerWrapper struct {
	io.Writer
}

func (w writerWrapper) Sync() error {
	return nil
}

func NewMultiWriteSyncer(ws ...WriteSyncer) WriteSyncer {
	if len(ws) == 1 {
		return ws[0]
	}
	return multiWriteSyncer(ws)
}
```

所以只要实现了 `io.Writer` 接口，都能通过 `AddSync` 方法将其转换为 WriteSyncer。除此之外，我们还可以使用 `NewMultiWriteSyncer` 实现让日志有多个输出。

### 相关扩展库

- [tchap/zapext](https://github.com/tchap/zapext)

## Zap 是如何实现高性能和并发安全的

### 对象复用

Zap 使用 **sync.Pool** 对 checkedEntry、Stack、Encoder、Buffer 等对象实现了并发安全的复用，部分关键代码如下：

```go
// internal/pool/pool.go
type Pool[T any] struct {
	pool sync.Pool
}

// New returns a new [Pool] for T, and will use fn to construct new Ts when
// the pool is empty.
func New[T any](fn func() T) *Pool[T] {
	return &Pool[T]{
		pool: sync.Pool{
			New: func() any {
				return fn()
			},
		},
	}
}

// buffer/pool.go
// A Pool is a type-safe wrapper around a sync.Pool.
type Pool struct {
	p *pool.Pool[*Buffer]
}

// NewPool constructs a new Pool.
func NewPool() Pool {
	return Pool{
		p: pool.New(func() *Buffer {
			return &Buffer{
				// 这里的 _size 为 1Kib
				bs: make([]byte, 0, _size),
			}
		}),
	}
}
```

> 一条日志编码器字符缓冲区的默认大小为 1KB，所以如果频繁写入长日志也会因为扩容而影响性能。

### 字段复用和避免反射

在上面介绍 Field 的章节中有提到过，Zap 通过自定义字段类型，让数值和字符这类简单类型能直接获取，复杂类型通过直接的类型断言获取，避免了通过反射动态获取类型和值。这也使得编码器的实现能完全避免反射的性能损耗。

# 常见问题

## 什么时候使用 DPanic？

DPanic 的意思是「development panic」。在开发模式下，它在打印 `DPanicLevel` 级别日志后会触发 Panic。在生产模式下则不会触发 Panic。DPanic 一般用在可能发生但实际上不应该发生错误的地方。如果你在开发时经常写类似这样的代码，就可以使用 DPanic：

```go
if err != nil {
  panic(fmt.Sprintf("err: %v", err))
}
```

## 怎么实现日志切割？

Zap 没有提供日志切割的支持，但是可以通过 lumberjack 简单封装 WriteSyncer 来支持日志切割的需求。

```go
import "github.com/natefinch/lumberjack/v3"

func getLogger(){
	// ......
	// 获取滚动写入器
	writer, err := lumberjack.NewRoller(filename, maxsize, &lumberjack.Options{
		MaxBackups: maxbackups,
		MaxAge:     maxage,
		Compress:   compress,
	})
	// 获取 zapCore
	core := zapcore.NewCore(
			zapcore.NewJSONEncoder(encoderConfig),
			zapcore.AddSync(writer),
			level,
		)
	// 获取 Logger
	logger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))
	return logger
}
```

# 参考

[github.com/uber-go/zap](https://github.com/uber-go/zap)
