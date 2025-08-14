import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function TestBackend() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Basic Edge Function Test',
        test: async () => {
          const { data, error } = await supabase.functions.invoke('test');
          if (error) throw error;
          return data;
        }
      },
      {
        name: 'Auth Status Check',
        test: async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          return { hasSession: !!session, user: session?.user?.email };
        }
      },
      {
        name: 'Database Connection Test',
        test: async () => {
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw error;
          return { connected: true, profilesTable: 'accessible' };
        }
      }
    ];

    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        setTestResults(prev => [...prev, {
          name: testCase.name,
          status: 'success',
          result,
          error: null
        }]);
      } catch (error: any) {
        setTestResults(prev => [...prev, {
          name: testCase.name,
          status: 'error',
          result: null,
          error: error.message
        }]);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Backend Test Suite</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Test Backend Connection'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.name}</span>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status === 'success' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {result.status}
                  </Badge>
                </div>
                
                {result.status === 'success' && result.result && (
                  <div className="text-sm text-muted-foreground">
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}
                
                {result.status === 'error' && (
                  <div className="text-sm text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}