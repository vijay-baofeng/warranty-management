
import {
  LayoutDashboard,
  FileText,
  Building2,
  Tag,
  Package,
  Hash,
  ChevronRight
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import Logo from '../../public/smallLogo.png';


const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
  },
  {
    title: "Claims",
    icon: FileText,
    key: "claims",
  },
  {
    title: "Brands",
    icon: Building2,
    key: "brands",
  },
  {
    title: "Categories",
    icon: Tag,
    key: "categories",
  },
  {
    title: "Products",
    icon: Package,
    key: "products",
  },
  {
    title: "Serial Numbers",
    icon: Hash,
    key: "serial-numbers",
  },
]

interface AppSidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function AppSidebar({ currentPage, setCurrentPage }: AppSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4 ">
        <div
          className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''
            }`}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            {/* <Package className="w-4 h-4 text-primary-foreground" /> */}
            <img src={Logo} />

          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">Warranty</h2>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Management</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => setCurrentPage(item.key)}
                    isActive={currentPage === item.key}
                    tooltip={isCollapsed ? item.title : undefined}
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="truncate">{item.title}</span>
                        {currentPage === item.key && (
                          <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
