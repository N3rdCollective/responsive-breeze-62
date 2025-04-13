
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const bookingRequests = [
  {
    name: "Davon Paul",
    email: "djepjdemiklc@gmail.com",
    eventDate: "May 9th, 2025",
    eventType: "corporate",
    duration: "4",
    ratePerHour: "$150",
    equipmentCost: "$0",
    total: "$0.00",
    paymentStatus: "No Payment"
  },
  // ... add other booking requests from the image
];

const BookingRequests = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>All Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rate/Hour</TableHead>
                <TableHead>Equipment Cost</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRequests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.eventDate}</TableCell>
                  <TableCell>{request.eventType}</TableCell>
                  <TableCell>{request.duration}</TableCell>
                  <TableCell>{request.ratePerHour}</TableCell>
                  <TableCell>{request.equipmentCost}</TableCell>
                  <TableCell>{request.total}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={request.paymentStatus === "No Payment" ? "destructive" : "default"}
                    >
                      {request.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingRequests;
