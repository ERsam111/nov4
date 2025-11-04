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
    <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="relative px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Supply Chain Optimization Suite
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Advanced tools to streamline operations, reduce costs, and optimize your supply chain
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-6 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Optimization Tools</h2>
          <p className="text-muted-foreground">Select a tool to create a new project and start optimizing</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.title}
                className={`group relative overflow-hidden border-2 transition-all duration-300 animate-fade-in ${
                  tool.comingSoon 
                    ? 'opacity-75 cursor-not-allowed border-muted' 
                    : 'hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 cursor-pointer border-border'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleToolClick(tool)}
              >
                {/* Gradient Overlay */}
                {!tool.comingSoon && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      tool.comingSoon 
                        ? 'bg-muted' 
                        : 'bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 group-hover:shadow-lg'
                    }`}>
                      <Icon className={`h-7 w-7 ${tool.comingSoon ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    {tool.comingSoon && (
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-0">
                  <Button 
                    variant={tool.comingSoon ? "ghost" : "default"}
                    className={`w-full transition-all duration-300 ${
                      tool.comingSoon 
                        ? 'cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90 group-hover:shadow-md'
                    }`}
                    disabled={tool.comingSoon}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tool.comingSoon ? 'Coming Soon' : 'Create Project'}
                  </Button>
                </CardContent>

                {/* Bottom border accent */}
                {!tool.comingSoon && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                )}
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