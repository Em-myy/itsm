const Loading = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-ink px-6">
      <div className="flex h-14 w-14 animate-badge-pulse items-center justify-center rounded-xl border border-ink-border text-xl font-semibold text-cream motion-reduce:animate-none">
        O
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
        Loading&hellip;
      </p>
    </div>
  );
};

export default Loading;
