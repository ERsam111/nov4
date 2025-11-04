import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Network, Gauge, Plus, Truck } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import { useState } from 'react';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';

const tools = [
  {
    icon: MapPin,
    title: 'GFA',
    description: 'Green Field Analysis',
    route: '/gfa',
    type: 'gfa' as const,
  },
  {
    icon: TrendingUp,
    title: 'Demand Forecasting',
    description: 'Predictive Analytics',
    route: '/demand-forecasting',
    type: 'forecasting' as const,
  },
  {
    icon: Network,
    title: 'Network Analysis',
    description: 'Supply Chain Optimization',
    route: '/network',
    type: 'network' as const,
    comingSoon: true,
  },
  {
    icon: Gauge,
    title: 'Inventory Optimization',
    description: 'Monte Carlo Optimization',
    route: '/inventory-optimization-v2',
    type: 'inventory' as const,
  },
  {
    icon: Truck,
    title: 'Transportation Optimization',
    description: 'Route & Load Planning',
    route: '/transportation',
    type: 'transportation' as const,
    comingSoon: true,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.comingSoon) return;
    setSelectedTool(tool);
    setCreateDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Supply Chain Optimization Suite</p>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Optimization Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.title}
                className={`group transition-all ${
                  tool.comingSoon 
                    ? 'opacity-75 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:border-primary/50 cursor-pointer'
                }`}
                onClick={() => handleToolClick(tool)}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {tool.title}
                    {tool.comingSoon && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-normal">
                        Soon
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-primary/10"
                    disabled={tool.comingSoon}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tool.comingSoon ? 'Coming Soon' : 'Create Project'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedTool && (
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          toolType={selectedTool.type}
          toolName={selectedTool.title}
          redirectTo={selectedTool.route}
        />
      )}
    </div>
  );
};

export default Dashboard;