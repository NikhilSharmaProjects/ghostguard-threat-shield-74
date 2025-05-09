
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ArrowDown, ArrowUp, Trash, Check } from 'lucide-react';
import ThreatBadge from '@/components/ThreatBadge';
import { generateMockThreats } from '@/lib/mock-data';
import { Threat } from '@/lib/models';

const Threats = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Threat>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  useEffect(() => {
    // Load mock data with more threats for this view
    const mockThreats = generateMockThreats(50);
    setThreats(mockThreats);
    setFilteredThreats(mockThreats);
  }, []);
  
  // Apply filters and sort
  useEffect(() => {
    let result = [...threats];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(threat => 
        threat.url.toLowerCase().includes(query) ||
        threat.details.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(threat => threat.category === categoryFilter);
    }
    
    // Apply source filter
    if (sourceFilter !== 'all') {
      result = result.filter(threat => threat.source === sourceFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(threat => threat.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredThreats(result);
  }, [threats, searchQuery, categoryFilter, sourceFilter, statusFilter, sortField, sortDirection]);
  
  const handleSort = (field: keyof Threat) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const getSortIcon = (field: keyof Threat) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3" /> : 
      <ArrowDown className="h-3 w-3" />;
  };
  
  const handleRowAction = (action: 'mitigate' | 'delete', threatId: string) => {
    if (action === 'mitigate') {
      // Mark threat as mitigated
      const updatedThreats = threats.map(threat => 
        threat.id === threatId ? { ...threat, status: 'mitigated' as const } : threat
      );
      setThreats(updatedThreats);
    } else if (action === 'delete') {
      // Remove threat from list
      const updatedThreats = threats.filter(threat => threat.id !== threatId);
      setThreats(updatedThreats);
    }
  };
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Threat Management</h1>
        <p className="text-muted-foreground">
          View, filter, and take action on detected security threats
        </p>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Threats</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="mitigated">Mitigated</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Threat Inventory</CardTitle>
                <CardDescription>
                  {filteredThreats.length} threats found
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search threats..." 
                    className="pl-8 bg-background" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-1.5">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="phishing">Phishing</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="scam">Scam</SelectItem>
                    <SelectItem value="suspicious">Suspicious</SelectItem>
                    <SelectItem value="safe">Safe</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="browser">Browser</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Threats Table */}
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th 
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/75"
                          onClick={() => handleSort('url')}
                        >
                          <div className="flex items-center gap-1">
                            URL {getSortIcon('url')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/75"
                          onClick={() => handleSort('score')}
                        >
                          <div className="flex items-center gap-1">
                            Severity {getSortIcon('score')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/75"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center gap-1">
                            Category {getSortIcon('category')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/75"
                          onClick={() => handleSort('source')}
                        >
                          <div className="flex items-center gap-1">
                            Source {getSortIcon('source')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/75"
                          onClick={() => handleSort('timestamp')}
                        >
                          <div className="flex items-center gap-1">
                            Timestamp {getSortIcon('timestamp')}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/75"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status {getSortIcon('status')}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredThreats.length > 0 ? (
                        filteredThreats.map((threat) => (
                          <tr key={threat.id} className="border-b">
                            <td className="px-4 py-3 break-all">{threat.url}</td>
                            <td className="px-4 py-3">
                              <ThreatBadge score={threat.score} />
                            </td>
                            <td className="px-4 py-3 capitalize">{threat.category}</td>
                            <td className="px-4 py-3 capitalize">{threat.source}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
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
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {threat.status !== 'mitigated' && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleRowAction('mitigate', threat.id)}
                                    title="Mark as mitigated"
                                  >
                                    <Check className="h-4 w-4 text-threat-low" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRowAction('delete', threat.id)}
                                  title="Delete threat"
                                >
                                  <Trash className="h-4 w-4 text-threat-critical" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            No threats found matching your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination - Simplified for demo */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <strong>1</strong> to <strong>{Math.min(filteredThreats.length, 10)}</strong> of <strong>{filteredThreats.length}</strong> results
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled={filteredThreats.length <= 10}>Next</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Threats;
