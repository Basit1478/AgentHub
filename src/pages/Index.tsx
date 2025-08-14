import { TestBackend } from "@/components/TestBackend";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">AI Agents Backend Testing</h1>
          <p className="text-xl text-muted-foreground">Test the backend connectivity and functionality</p>
        </div>
        <TestBackend />
      </div>
    </div>
  );
};

export default Index;
