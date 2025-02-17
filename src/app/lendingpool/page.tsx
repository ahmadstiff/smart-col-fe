"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreatePool from "./_components/create-pool";
import CreatePosition from "./_components/create-position";
import Operations from "./_components/operations";
import { CoinsIcon, LayersIcon, Settings2Icon } from "lucide-react";

export default function LendingPage() {
  const [activeTab, setActiveTab] = useState("pool");

  return (
    <div className="min-h-screen mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Lending Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your lending pools and positions
          </p>
        </div>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-800">
            <Tabs
              defaultValue="pool"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-2 gap-4 bg-gray-900/50">
                <TabsTrigger
                  value="pool"
                  className="data-[state=active]:bg-blue-600"
                >
                  <CoinsIcon className="w-4 h-4 mr-2" />
                  Create Pool
                </TabsTrigger>
                <TabsTrigger
                  value="position"
                  className="data-[state=active]:bg-blue-600 hidden"
                >
                  <LayersIcon className="w-4 h-4 mr-2" />
                  Create Position
                </TabsTrigger>
                <TabsTrigger
                  value="operations"
                  className="data-[state=active]:bg-blue-600"
                >
                  <Settings2Icon className="w-4 h-4 mr-2" />
                  Operations
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="pool" className="m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-100">
                          Create Lending Pool
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Set up a new lending pool with custom parameters
                        </p>
                      </div>
                    </div>
                    <CreatePool />
                  </div>
                </TabsContent>

                <TabsContent value="position" className="m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-100">
                          Create Position
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Open a new lending or borrowing position
                        </p>
                      </div>
                    </div>
                    <CreatePosition />
                  </div>
                </TabsContent>

                <TabsContent value="operations" className="m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-100">
                          Operations
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Manage your existing positions and pools
                        </p>
                      </div>
                    </div>
                    <Operations />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
