"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NewPurchaseOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const [formData, setFormData] = useState({
    number: `PO${Date.now().toString().slice(-6)}`,
    vendorId: "",
    projectId: "",
    date: new Date().toISOString().split('T')[0],
    expectedDate: "",
    currency: "INR",
    note: "",
    lines: [
      { description: "", quantity: 1, unit: "Unit", unitPrice: 0, taxPercent: 0, amount: 0 }
    ]
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // First, seed mock vendors if they don't exist
      await fetch("/api/seed/vendors", { method: "POST" });
      
      // Fetch vendors
      const vendorsRes = await fetch("/api/partners?type=VENDOR");
      if (vendorsRes.ok) {
        const data = await vendorsRes.json();
        setVendors(data);
      }

      // Fetch projects
      const projectsRes = await fetch("/api/projects");
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;

    // Recalculate amount
    const quantity = parseFloat(newLines[index].quantity) || 0;
    const unitPrice = parseFloat(newLines[index].unitPrice) || 0;
    newLines[index].amount = quantity * unitPrice;

    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        { description: "", quantity: 1, unit: "Unit", unitPrice: 0, taxPercent: 0, amount: 0 }
      ]
    });
  };

  const removeLine = (index) => {
    if (formData.lines.length > 1) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData({ ...formData, lines: newLines });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.lines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
    const taxTotal = formData.lines.reduce((sum, line) => {
      const amount = parseFloat(line.amount) || 0;
      const taxPercent = parseFloat(line.taxPercent) || 0;
      return sum + (amount * taxPercent / 100);
    }, 0);
    const total = subtotal + taxTotal;
    
    return { subtotal, taxTotal, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { subtotal, taxTotal, total } = calculateTotals();

      const payload = {
        ...formData,
        partnerId: formData.vendorId || null,
        projectId: formData.projectId || null,
        subtotal,
        taxTotal,
        total,
        status: "PENDING_APPROVAL", // Request approval from manager
      };

      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Purchase Order request submitted for approval!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to create purchase order"}`);
      }
    } catch (error) {
      console.error("Error submitting purchase order:", error);
      alert("Failed to submit purchase order request");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxTotal, total } = calculateTotals();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-2">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-2xl">Purchase Order Create/Edit View</CardTitle>
          <div className="flex gap-4 mt-4">
            <Button type="submit" form="po-form" disabled={loading}>
              {loading ? "Creating..." : "Create Bills"}
            </Button>
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form id="po-form" onSubmit={handleSubmit} className="space-y-6">
            {/* PO Number */}
            <div className="border-b pb-4">
              <Label className="text-lg font-semibold">{formData.number}</Label>
            </div>

            {/* Vendor and Project Selection */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project">Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Order Lines Section */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4 border-b pb-2">Order Lines</h3>
              
              {/* Table Header */}
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <div>Description</div>
                <div>Quantity</div>
                <div>Unit</div>
                <div>Unit Price</div>
                <div>Taxes</div>
                <div>Amount</div>
                <div></div>
              </div>

              {/* Order Lines */}
              {formData.lines.map((line, index) => (
                <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 mb-3 items-center">
                  <Input
                    type="text"
                    value={line.description}
                    onChange={(e) => handleLineChange(index, "description", e.target.value)}
                    placeholder="Enter product/service description"
                    className="w-full"
                  />

                  <Input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(index, "quantity", e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />

                  <Input
                    type="text"
                    value={line.unit}
                    onChange={(e) => handleLineChange(index, "unit", e.target.value)}
                    placeholder="Unit"
                    className="w-full"
                  />

                  <Input
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(index, "unitPrice", e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />

                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={line.taxPercent}
                      onChange={(e) => handleLineChange(index, "taxPercent", e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full"
                    />
                    <span className="text-sm">%</span>
                  </div>

                  <div className="font-medium">
                    ₹{parseFloat(line.amount || 0).toFixed(2)}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                    disabled={formData.lines.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {/* Add Line Button */}
              <Button type="button" variant="outline" size="sm" onClick={addLine} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add a line
              </Button>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Untaxed Amount:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
