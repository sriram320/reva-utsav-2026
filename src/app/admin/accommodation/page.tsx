"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bed, CheckCircle, XCircle, Trash2, Plus, Home } from "lucide-react";

export default function AccommodationManager() {
    const [bookingEnabled, setBookingEnabled] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"requests" | "properties">("requests");

    const [newProperty, setNewProperty] = useState({
        name: "",
        type: "PG",
        gender: "Boys",
        capacity: 0,
        costPrice: 0,
        sellingPrice: 0,
        contactPerson: "",
        contactPhone: "",
        address: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch settings
            const settingsRes = await fetch("/api/admin/settings");
            const settingsData = await settingsRes.json();
            setBookingEnabled(settingsData.accommodation_open === 'true');

            // Fetch accommodation requests
            const requestsRes = await fetch("/api/admin/accommodation");
            const requestsData = await requestsRes.json();
            setRequests(requestsData.requests || []);

            // Fetch properties
            const propertiesRes = await fetch("/api/admin/accommodation/properties");
            const propertiesData = await propertiesRes.json();
            setProperties(propertiesData.properties || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
        setLoading(false);
    };

    const toggleBooking = async (checked: boolean) => {
        setBookingEnabled(checked);
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "accommodation_open", value: String(checked) })
            });
        } catch (error) {
            setBookingEnabled(!checked);
            console.error("Failed to update setting", error);
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            await fetch("/api/admin/accommodation", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: "approved" })
            });
            fetchData();
        } catch (error) {
            console.error("Failed to approve request", error);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await fetch("/api/admin/accommodation", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: "rejected" })
            });
            fetchData();
        } catch (error) {
            console.error("Failed to reject request", error);
        }
    };

    const handleDeleteRequest = async (requestId: number) => {
        if (confirm("Are you sure you want to delete this request?")) {
            try {
                await fetch(`/api/admin/accommodation?id=${requestId}`, { method: "DELETE" });
                fetchData();
            } catch (error) {
                console.error("Failed to delete request", error);
            }
        }
    };

    const handleAddProperty = async () => {
        if (!newProperty.name) return;
        try {
            await fetch("/api/admin/accommodation/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProperty)
            });
            setNewProperty({
                name: "",
                type: "PG",
                gender: "Boys",
                capacity: 0,
                costPrice: 0,
                sellingPrice: 0,
                contactPerson: "",
                contactPhone: "",
                address: ""
            });
            fetchData();
        } catch (error) {
            console.error("Failed to add property", error);
        }
    };

    const handleDeleteProperty = async (propertyId: number) => {
        if (confirm("Are you sure you want to delete this property?")) {
            try {
                await fetch(`/api/admin/accommodation/properties?id=${propertyId}`, { method: "DELETE" });
                fetchData();
            } catch (error) {
                console.error("Failed to delete property", error);
            }
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-white">Loading accommodation data...</div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-orbitron text-white">Accommodation Command Center</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setView("requests")}
                    className={`px-4 py-2 font-medium ${view === "requests" ? "text-secondary border-b-2 border-secondary" : "text-gray-400"}`}
                >
                    Booking Requests
                </button>
                <button
                    onClick={() => setView("properties")}
                    className={`px-4 py-2 font-medium ${view === "properties" ? "text-secondary border-b-2 border-secondary" : "text-gray-400"}`}
                >
                    PG Partners & Properties
                </button>
            </div>

            {view === "requests" && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Total Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{requests.length}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Pending</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-yellow-400">
                                    {requests.filter(r => r.status === 'pending').length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Approved</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-400">
                                    {requests.filter(r => r.status === 'approved').length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-400">Checked In</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-400">
                                    {requests.filter(r => r.checkedIn).length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Request Queue */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Request Queue</CardTitle>
                            <CardDescription>Manage accommodation booking requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {requests.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    No accommodation requests yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                                        <Bed className="text-secondary" size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">User ID: {request.userId}</div>
                                                        <div className="text-sm text-gray-400">
                                                            {request.checkInDate && new Date(request.checkInDate).toLocaleDateString()} -
                                                            {request.checkOutDate && new Date(request.checkOutDate).toLocaleDateString()}
                                                            {request.numberOfDays && ` (${request.numberOfDays} days)`}
                                                        </div>
                                                        {request.roomAllotted && (
                                                            <div className="text-sm text-green-400">Room: {request.roomAllotted}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        request.status === 'approved' ? 'default' :
                                                            request.status === 'rejected' ? 'destructive' :
                                                                'secondary'
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                                {request.checkedIn && (
                                                    <Badge className="bg-blue-500">Checked In</Badge>
                                                )}
                                                <div className="flex gap-2">
                                                    {request.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(request.id)}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle size={16} className="mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleReject(request.id)}
                                                            >
                                                                <XCircle size={16} className="mr-1" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteRequest(request.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {view === "properties" && (
                <>
                    {/* Properties List */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">PG Partners & Properties</CardTitle>
                            <CardDescription>Manage accommodation inventory</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {properties.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    No properties added yet. Add your first PG partner or hostel below.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {properties.map((property: any) => (
                                        <div key={property.id} className="p-4 bg-zinc-900 rounded-lg">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-medium text-white text-lg">{property.name}</div>
                                                    <div className="text-sm text-gray-400">{property.type} • {property.gender}</div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteProperty(property.id)}
                                                    className="text-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Capacity:</span>
                                                    <span className="text-white ml-2">{property.capacity}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Occupied:</span>
                                                    <span className="text-white ml-2">{property.occupied || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Cost:</span>
                                                    <span className="text-white ml-2">₹{property.costPrice}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Selling:</span>
                                                    <span className="text-green-400 ml-2">₹{property.sellingPrice}</span>
                                                </div>
                                            </div>
                                            {property.contactPerson && (
                                                <div className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-400">
                                                    {property.contactPerson} • {property.contactPhone}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add Property Form */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Home size={20} />
                                Add New Property
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-400">Property Name</Label>
                                    <Input
                                        placeholder="e.g., Sai PG, Reva Boys Hostel"
                                        value={newProperty.name}
                                        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-400">Type</Label>
                                    <select
                                        value={newProperty.type}
                                        onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white mt-1"
                                    >
                                        <option value="PG">PG</option>
                                        <option value="Hostel">Hostel</option>
                                        <option value="Hotel">Hotel</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Gender</Label>
                                    <select
                                        value={newProperty.gender}
                                        onChange={(e) => setNewProperty({ ...newProperty, gender: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white mt-1"
                                    >
                                        <option value="Boys">Boys</option>
                                        <option value="Girls">Girls</option>
                                        <option value="Co-ed">Co-ed</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Capacity</Label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={newProperty.capacity}
                                        onChange={(e) => setNewProperty({ ...newProperty, capacity: parseInt(e.target.value) || 0 })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-400">Cost Price (₹/bed)</Label>
                                    <Input
                                        type="number"
                                        placeholder="200"
                                        value={newProperty.costPrice}
                                        onChange={(e) => setNewProperty({ ...newProperty, costPrice: parseInt(e.target.value) || 0 })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-400">Selling Price (₹/bed)</Label>
                                    <Input
                                        type="number"
                                        placeholder="500"
                                        value={newProperty.sellingPrice}
                                        onChange={(e) => setNewProperty({ ...newProperty, sellingPrice: parseInt(e.target.value) || 0 })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-400">Contact Person</Label>
                                    <Input
                                        placeholder="Name"
                                        value={newProperty.contactPerson}
                                        onChange={(e) => setNewProperty({ ...newProperty, contactPerson: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-400">Contact Phone</Label>
                                    <Input
                                        placeholder="Phone number"
                                        value={newProperty.contactPhone}
                                        onChange={(e) => setNewProperty({ ...newProperty, contactPhone: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-gray-400">Address</Label>
                                    <Input
                                        placeholder="Full address"
                                        value={newProperty.address}
                                        onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800 mt-1"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAddProperty} className="w-full mt-4 bg-secondary text-black hover:bg-yellow-500">
                                <Plus size={16} className="mr-2" />
                                Add Property
                            </Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
