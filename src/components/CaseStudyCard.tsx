'use client'

interface Props {
  icon: string
  industry: string
  title: string
  problem: string
  solution: string
  feature: string
  featureColor: string
  illustration: React.ReactNode
}

export default function CaseStudyCard({ icon, industry, title, problem, solution, feature, featureColor, illustration }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden card-hover group">
      {/* イラストエリア */}
      <div className="relative h-48 bg-gradient-to-br from-slate-50 to-blue-50/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div className="relative group-hover:scale-105 transition-transform duration-500">
          {illustration}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-semibold text-foreground/55 uppercase tracking-wider">{industry}</span>
          <span className={`ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full ${featureColor}`}>
            {feature}
          </span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">{title}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-danger font-bold text-xs mt-0.5 shrink-0">Before</span>
            <p className="text-foreground/60 leading-relaxed">{problem}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-success font-bold text-xs mt-0.5 shrink-0">After</span>
            <p className="text-foreground/70 leading-relaxed font-medium">{solution}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
