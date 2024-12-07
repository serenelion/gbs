import { Sparkles } from "lucide-react";

export default function HomeHeader() {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
        Giving Back Studio <Sparkles className="h-8 w-8 text-yellow-500" />
      </h1>
      <p className="text-gray-600">
        Connect and share opportunities with the social enterprise community
      </p>
    </div>
  );
} 