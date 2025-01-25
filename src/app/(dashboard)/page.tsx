import Link from 'next/link';

export default function Dashboard() {
  const dashboardItems = [
    { title: 'Analytics', href: '/analytics', description: 'View your performance metrics' },
    { title: 'Chatbot', href: '/chatbot', description: 'Manage your AI chatbot' },
    { title: 'Integrations', href: '/integrations', description: 'Connect your favorite tools' },
    { title: 'Leads', href: '/leads', description: 'Track and manage leads' },
    { title: 'Live Chat', href: '/live-chat', description: 'Real-time customer conversations' },
    { title: 'Meetings', href: '/meetings', description: 'Schedule and manage meetings' },
  ];

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 