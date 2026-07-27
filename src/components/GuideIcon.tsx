import {
  Eye,
  Tag,
  Thermometer,
  Timer,
  TriangleAlert,
  Utensils,
  Warehouse,
  Wine,
  type LucideProps,
} from 'lucide-react'

const icons = {
  eye: Eye,
  tag: Tag,
  thermometer: Thermometer,
  timer: Timer,
  'triangle-alert': TriangleAlert,
  utensils: Utensils,
  warehouse: Warehouse,
  wine: Wine,
}

export function GuideIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] || Wine
  return <Icon {...props} />
}
