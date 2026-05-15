/**
 * IconPicker.jsx — Production Secure Mapping Version
 */
import * as Icons from 'lucide-react'

const iconMapping = {
  'home': Icons.Home,
  'bar-chart': Icons.BarChart3,
  'folder': Icons.Folder,
  'users': Icons.Users,
  'settings': Icons.Settings,
  'database': Icons.Database,
  'layers': Icons.Layers,
  'check-square': Icons.CheckSquare,
  'calendar': Icons.Calendar,
  'file-text': Icons.FileText,
  'briefcase': Icons.Briefcase,
  'terminal': Icons.Terminal,
  'code': Icons.Code
}

export function getIcon(iconName) {
  if (!iconName) return Icons.Folder
  const cleanKey = String(iconName).toLowerCase().trim()
  return iconMapping[cleanKey] || Icons.Folder
}

export default getIcon