import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Network, Gauge, FolderOpen, Plus, Truck, Download, FileSpreadsheet } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import { useState } from 'react';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';

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

const templateExamples = [
  {
    title: 'GFA Template',
    description: 'Sample customer and facility data',
    data: [
      { Customer: 'Customer A', Latitude: 40.7128, Longitude: -74.0060, Demand: 1000, Product: 'Product 1' },
      { Customer: 'Customer B', Latitude: 34.0522, Longitude: -118.2437, Demand: 1500, Product: 'Product 1' },
      { Customer: 'Customer C', Latitude: 41.8781, Longitude: -87.6298, Demand: 800, Product: 'Product 2' },
    ],
  },
  {
    title: 'Demand Forecasting Template',
    description: 'Historical demand data',
    data: [
      { Date: '2024-01-01', Product: 'Product A', Demand: 120, Region: 'North' },
      { Date: '2024-02-01', Product: 'Product A', Demand: 135, Region: 'North' },
      { Date: '2024-03-01', Product: 'Product A', Demand: 150, Region: 'North' },
    ],
  },
  {
    title: 'Inventory Optimization Template',
    description: 'Product and policy parameters',
    data: [
      { Product: 'SKU-001', LeadTime: 7, HoldingCost: 2.5, OrderCost: 50, ServiceLevel: 0.95 },
      { Product: 'SKU-002', LeadTime: 14, HoldingCost: 3.0, OrderCost: 75, ServiceLevel: 0.98 },
      { Product: 'SKU-003', LeadTime: 5, HoldingCost: 1.8, OrderCost: 40, ServiceLevel: 0.90 },
    ],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templateExamples[0] | null>(null);

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.comingSoon) return;
    setSelectedTool(tool);
    setCreateDialogOpen(true);
  };

  const handleTemplateClick = (template: typeof templateExamples[0]) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const downloadTemplate = () => {
    if (!selectedTemplate) return;
    const ws = XLSX.utils.json_to_sheet(selectedTemplate.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${selectedTemplate.title.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Supply Chain Optimization Suite</p>
      </div>

      {/* Template Examples */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Template Examples</h2>
        <p className="text-sm text-muted-foreground mb-4">Download sample data to get started quickly</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templateExamples.map((template) => (
            <Card 
              key={template.title}
              className="group hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                  <FileSpreadsheet className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-base">{template.title}</CardTitle>
                <CardDescription className="text-xs">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full group-hover:bg-secondary/10 text-xs h-8">
                  <Download className="h-3 w-3 mr-2" />
                  View & Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
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

      {selectedTemplate && (
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.title}</DialogTitle>
              <DialogDescription>{selectedTemplate.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(selectedTemplate.data[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTemplate.data.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((value, cellIdx) => (
                          <TableCell key={cellIdx}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;