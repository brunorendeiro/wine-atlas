import {
  Eye,
  CakeSlice,
  CircleDot,
  RefreshCcw,
  Sparkles,
  Tag,
  Thermometer,
  Timer,
  TriangleAlert,
  Utensils,
  Warehouse,
  Wind,
  Wine,
  type LucideProps,
} from 'lucide-react'

const icons = {
  'cake-slice': CakeSlice,
  'circle-dot': CircleDot,
  eye: Eye,
  refresh: RefreshCcw,
  sparkles: Sparkles,
  tag: Tag,
  thermometer: Thermometer,
  timer: Timer,
  'triangle-alert': TriangleAlert,
  utensils: Utensils,
  warehouse: Warehouse,
  wind: Wind,
  wine: Wine,
}

export function GuideIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] || Wine
  return <Icon {...props} />
}
