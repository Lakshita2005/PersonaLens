export const AuthVisualPanel = () => (
  <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
    <img
      src="/college_pic.webp"
      alt="K.R. Mangalam University campus"
      className="h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,14,24,0.08),rgba(9,14,24,0.78))]" />
    <div className="absolute inset-x-0 bottom-0 p-10 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
        College readiness workspace
      </p>
      <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight tracking-normal">
        K.R. Mangalam University
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-white/78">
        PersonaLens helps students prepare for interviews, save results, compare
        progress, and walk into mentor reviews with clearer evidence.
      </p>
    </div>
  </div>
);
