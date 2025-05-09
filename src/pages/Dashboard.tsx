
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ShieldAlert, ShieldX, Activity, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import ThreatBadge from '@/components/ThreatBadge';
import { generateMockThreats, calculateThreatStats, generateWeeklyThreatData } from '@/lib/mock-data';
import { Threat, ThreatStats, getThreatLevel } from '@/lib/models';

const Dashboard = () => {
  const isMobile = useIsMobile();
  const [threats, setThreats] = useState<Threat[]>([]);
  const [stats, setStats] = useState<ThreatStats>({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    mitigated: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Load mock data
    const mockThreats = generateMockThreats(25);
    const mockStats = calculateThreatStats(mockThreats);
    const mockChartData = generateWeeklyThreatData();
    
    setThreats(mockThreats);
    setStats(mockStats);
    setChartData(mockChartData);
  }, []);
  
  // Get recent threats for the quick view
  const recentThreats = threats
    .filter((threat) => threat.status !== 'mitigated')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  const activeThreatsCount = stats.critical + stats.high + stats.medium + stats.low;
  const threatPercentage = stats.total > 0 
    ? Math.round((activeThreatsCount / stats.total) * 100) 
    : 0;
  
  const criticalPercentage = activeThreatsCount > 0 
    ? Math.round((stats.critical / activeThreatsCount) * 100) 
    : 0;
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage real-time security threats
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search threats..." 
              className="pl-8 bg-background" 
            />
          </div>
          <Button className="bg-ghost-400 hover:bg-ghost-500">Scan New URL</Button>
        </div>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <ShieldAlert className="h-4 w-4 text-threat-high" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeThreatsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {threatPercentage}% of total threats
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
            <ShieldX className="h-4 w-4 text-threat-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalPercentage}% of active threats
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitigated Threats</CardTitle>
            <ShieldCheck className="h-4 w-4 text-threat-low" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mitigated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully protected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Status</CardTitle>
            <Activity className="h-4 w-4 text-ghost-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Threats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Threat History Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Threat Activity</CardTitle>
                <CardDescription>
                  Visualize the frequency and types of threats detected over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 30, 40, 0.9)',
                        borderColor: 'rgba(120, 120, 120, 0.3)',
                        color: '#fff'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="phishing" fill="#ef4444" name="Phishing" />
                    <Bar dataKey="malware" fill="#f97316" name="Malware" />
                    <Bar dataKey="scam" fill="#facc15" name="Scam" />
                    <Bar dataKey="suspicious" fill="#9b87f5" name="Suspicious" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Quick View of Recent Threats */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Threat Detections</CardTitle>
                <CardDescription>
                  Latest security threats requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentThreats.length > 0 ? (
                    recentThreats.map((threat) => (
                      <div 
                        key={threat.id} 
                        className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm line-clamp-1 break-all">
                            {threat.url}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <ThreatBadge score={threat.score} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(threat.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent threats detected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Threat Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Distribution</CardTitle>
                <CardDescription>
                  Breakdown of current active threats by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Critical Threats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-threat-critical rounded-full" />
                        <span className="font-medium text-sm">Critical</span>
                      </div>
                      <span>{stats.critical}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-threat-critical" 
                        style={{ width: `${activeThreatsCount ? (stats.critical / activeThreatsCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* High Threats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-threat-high rounded-full" />
                        <span className="font-medium text-sm">High</span>
                      </div>
                      <span>{stats.high}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-threat-high" 
                        style={{ width: `${activeThreatsCount ? (stats.high / activeThreatsCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Medium Threats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-threat-medium rounded-full" />
                        <span className="font-medium text-sm">Medium</span>
                      </div>
                      <span>{stats.medium}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-threat-medium" 
                        style={{ width: `${activeThreatsCount ? (stats.medium / activeThreatsCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Low Threats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-threat-low rounded-full" />
                        <span className="font-medium text-sm">Low</span>
                      </div>
                      <span>{stats.low}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-threat-low" 
                        style={{ width: `${activeThreatsCount ? (stats.low / activeThreatsCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Recent Threats Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Threats</CardTitle>
              <CardDescription>
                Comprehensive list of recently detected security threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-sm font-medium px-4 py-3">URL</th>
                      <th className="text-left text-sm font-medium px-4 py-3">Severity</th>
                      <th className="text-left text-sm font-medium px-4 py-3">Source</th>
                      <th className="text-left text-sm font-medium px-4 py-3">Timestamp</th>
                      <th className="text-left text-sm font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threats
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((threat) => (
                        <tr key={threat.id} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm break-all">{threat.url}</td>
                          <td className="px-4 py-3">
                            <ThreatBadge score={threat.score} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="capitalize">{threat.source}</span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {new Date(threat.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              threat.status === 'active' ? 'bg-threat-critical/10 text-threat-critical' :
                              threat.status === 'investigating' ? 'bg-threat-medium/10 text-threat-medium' :
                              'bg-threat-low/10 text-threat-low'
                            }`}>
                              {threat.status.charAt(0).toUpperCase() + threat.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Threat Analytics</CardTitle>
              <CardDescription>
                Detailed analysis of detected threats and patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 30, 40, 0.9)',
                      borderColor: 'rgba(120, 120, 120, 0.3)',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="phishing" 
                    fill="#ef4444" 
                    name="Phishing"
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="malware" 
                    fill="#f97316" 
                    name="Malware"
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="scam" 
                    fill="#facc15" 
                    name="Scam"
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="suspicious" 
                    fill="#9b87f5" 
                    name="Suspicious"
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
