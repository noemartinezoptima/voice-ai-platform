import { Link, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
    BarChart3,
    Bell,
    LayoutDashboard,
    Phone,
    Smartphone,
    GitBranch,
    Key,
    Users,
    Settings,
    User,
    LogOut,
    ChevronUp,
    FileText,
    Radio,
    Webhook,
    MessageSquare,
    MessageSquareText,
    CreditCard,
    Activity,
    Bot,
    Server,
    Mic,
    Shield,
    Award,
    AlertTriangle,
} from 'lucide-react'

import { Sidebar, SidebarHeader, SidebarBody, SidebarFooter, SidebarSection, SidebarItem, SidebarLabel, SidebarSpacer } from '@/Components/catalyst/sidebar'
import { SidebarLayout } from '@/Components/catalyst/sidebar-layout'
import { Navbar, NavbarSpacer, NavbarSection } from '@/Components/catalyst/navbar'
import { Avatar, AvatarButton } from '@/Components/catalyst/avatar'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownDivider, DropdownLabel } from '@/Components/catalyst/dropdown'
import { dashboard, logout } from '@/routes'
import { index as analyticsIndex } from '@/actions/App/Http/Controllers/Web/AnalyticsController'
import { index as flowsIndex } from '@/actions/App/Http/Controllers/Web/FlowController'
import { index as callsIndex } from '@/actions/App/Http/Controllers/Web/CallController'
import { index as monitorIndex } from '@/actions/App/Http/Controllers/Web/MonitorController'
import { index as apiTokensIndex } from '@/actions/App/Http/Controllers/Web/ApiTokenController'
import { edit as profileEdit } from '@/routes/profile'
import { index as teamIndex } from '@/routes/team'
import { tenant as settingsTenant } from '@/routes/settings'
import { edit as settingsVoice } from '@/actions/App/Http/Controllers/Web/VoiceSettingsController'
import { index as documentsIndex } from '@/actions/App/Http/Controllers/Web/DocumentsController'
import { index as webhooksIndex } from '@/actions/App/Http/Controllers/Web/WebhookDestinationController'
import { index as smsIndex } from '@/actions/App/Http/Controllers/Web/SmsController'
import { index as billingIndex } from '@/actions/App/Http/Controllers/Web/BillingController'
import { index as activityIndex } from '@/actions/App/Http/Controllers/Web/ActivityLogController'
import { index as voicesIndex } from '@/actions/App/Http/Controllers/Web/VoiceController'
import { index as agentsIndex } from '@/actions/App/Http/Controllers/Web/ElevenLabsAgentController'
import { index as systemIndex } from '@/actions/App/Http/Controllers/Web/SystemHealthController'

const navItems = [
    { label: 'Dashboard', href: dashboard().url, icon: LayoutDashboard, active: 'dashboard' },
    { label: 'Notifications', href: '/notifications', icon: Bell, active: 'notifications.*' },
    { label: 'Analytics', href: analyticsIndex().url, icon: BarChart3, active: 'analytics.*' },
    { label: 'Flows', href: flowsIndex().url, icon: GitBranch, active: 'flows.*' },
    { label: 'Calls', href: callsIndex().url, icon: Phone, active: 'calls.*' },
    { label: 'Transcripts', href: '/transcripts', icon: MessageSquareText, active: 'transcripts.*' },
    { label: 'Quality', href: '/quality', icon: Award, active: 'quality.*' },
    { label: 'Monitor', href: monitorIndex().url, icon: Radio, active: 'monitor.*' },
    { label: 'SMS', href: smsIndex().url, icon: MessageSquare, active: 'sms.*' },
    { label: 'Team', href: teamIndex().url, icon: Users, active: 'team.*' },
    { label: 'API Tokens', href: apiTokensIndex().url, icon: Key, active: 'api-tokens.*' },
    { label: 'Settings', href: settingsTenant().url, icon: Settings, active: 'settings.tenant' },
    { label: 'Voice & Language', href: settingsVoice().url, icon: Phone, active: 'settings.voice' },
    { label: 'Voices', href: voicesIndex().url, icon: Mic, active: 'settings.voices.*' },
    { label: 'Documents', href: documentsIndex().url, icon: FileText, active: 'settings.documents.*' },
    { label: 'Webhooks', href: webhooksIndex().url, icon: Webhook, active: 'settings.webhooks.*' },
    { label: 'Billing', href: billingIndex().url, icon: CreditCard, active: 'billing.*' },
    { label: 'Activity Log', href: activityIndex().url, icon: Activity, active: 'settings.activity.*' },
    { label: 'Errors', href: '/settings/errors', icon: AlertTriangle, active: 'settings.errors.*' },
    { label: 'Agents', href: agentsIndex().url, icon: Bot, active: 'settings.agents.*' },
    { label: 'Phone Numbers', href: '/settings/phone-numbers', icon: Smartphone, active: 'settings.phone-numbers' },
    { label: 'System', href: systemIndex().url, icon: Server, active: 'settings.system' },
    { label: 'Roles', href: '/settings/roles', icon: Shield, active: 'settings.roles' },
]

function AccountDropdownMenu({ anchor }) {
    const user = usePage().props.auth.user

    return (
        <DropdownMenu className="min-w-64" anchor={anchor}>
            <DropdownItem href={profileEdit().url}>
                <User data-slot="icon" />
                <DropdownLabel>Profile</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href={logout().url}>
                <LogOut data-slot="icon" />
                <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
        </DropdownMenu>
    )
}

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user
    const flash = usePage().props.flash
    const pathname = window.location.pathname
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success)
        }
        if (flash?.error) {
            toast.error(flash.error)
        }
    }, [flash?.success, flash?.error])

    useEffect(() => {
        let cancelled = false
        function fetchUnread() {
            fetch('/notifications/unread')
                .then((r) => r.json())
                .then((data) => { if (!cancelled) setUnreadCount(data.count ?? 0) })
                .catch(() => {})
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000)
        return () => { cancelled = true; clearInterval(interval) }
    }, [])

    return (
        <SidebarLayout
            navbar={
                <Navbar>
                    <NavbarSpacer />
                    <NavbarSection>
                        <Link
                            href="/notifications"
                            className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        >
                            <Bell className="size-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold leading-none text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
                        <Dropdown>
                            <DropdownButton as={NavbarItem_}>
                                <Avatar src={null} initials={user.name.charAt(0).toUpperCase()} square />
                            </DropdownButton>
                            <AccountDropdownMenu anchor="bottom end" />
                        </Dropdown>
                    </NavbarSection>
                </Navbar>
            }
            sidebar={
                <Sidebar>
                    <SidebarHeader>
                        <SidebarItem href="/">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white text-xs font-bold">
                                V
                            </div>
                            <SidebarLabel>Voice AI</SidebarLabel>
                        </SidebarItem>
                    </SidebarHeader>

                    <SidebarBody>
                        <SidebarSection>
                            {navItems.map((item) => (
                                <SidebarItem
                                    key={item.label}
                                    href={item.href}
                                    current={route().current(item.active)}
                                >
                                    <item.icon data-slot="icon" />
                                    <SidebarLabel>{item.label}</SidebarLabel>
                                </SidebarItem>
                            ))}
                        </SidebarSection>

                        <SidebarSpacer />
                    </SidebarBody>

                    <SidebarFooter className="max-lg:hidden">
                        <Dropdown>
                            <DropdownButton as={SidebarItem}>
                                <span className="flex min-w-0 items-center gap-3">
                                    <Avatar
                                        src={null}
                                        initials={user.name.charAt(0).toUpperCase()}
                                        square
                                        className="size-10"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                                            {user.name}
                                        </span>
                                        <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                                            {user.email}
                                        </span>
                                    </span>
                                </span>
                                <ChevronUp data-slot="icon" />
                            </DropdownButton>
                            <AccountDropdownMenu anchor="top start" />
                        </Dropdown>
                    </SidebarFooter>
                </Sidebar>
            }
        >
            {children}
        </SidebarLayout>
    )
}

// Small helper to avoid naming conflict with NavbarItem import
function NavbarItem_({ children, onClick, ...props }) {
    return (
        <button type="button" onClick={onClick} {...props}>
            {children}
        </button>
    )
}
