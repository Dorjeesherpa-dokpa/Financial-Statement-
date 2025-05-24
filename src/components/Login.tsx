import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Logo from './Logo';
interface LoginProps {
  onLogin: () => void;
}
const Login: React.FC<LoginProps> = ({
  onLogin
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if the password is correct
    if (password === 'Cyclon@2025') {
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
        toast({
          title: "Login Successful",
          description: "Welcome to Zeta Energy Financial Statement"
        });
      }, 500);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect password. Please try again."
        });
      }, 500);
    }
  };
  return <div className="login-container">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Zeta Energy</CardTitle>
          <CardDescription>Financial Statement System</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Input id="password" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-400" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>;
};
export default Login;