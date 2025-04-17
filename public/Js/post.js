// cancel
router.post("/booking/cancel", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
    await Booking.deleteOne({ user: user.id, status: "saved" });
    res.redirect("/profile");
  });
  
  // quote
  router.post("/booking/quote", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
  
    const booking = await Booking.findOne({ user: user.id, status: "saved" });
    if (!booking) return res.status(404).send("No saved booking found.");
  
    booking.status = "quotation";
    await booking.save();
  
    res.send("Your quotation request has been submitted.");
  });
  
  // Cancel/Delete booking from booking history
router.post("/my-bookings/:id/delete", async (req, res) => {
  const user = req.cookies.user;
  if (!user) return res.redirect("/login");

  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: user.id });
    if (!booking) return res.status(404).send("Booking not found.");

    // Make associated cars available again
    const carIds = booking.selectedCars.map(item => item.car);
    await Car.updateMany({ _id: { $in: carIds } }, { available: true });

    // Delete the booking
    await Booking.deleteOne({ _id: req.params.id });

    res.redirect("/my-bookings");
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).send("Failed to cancel booking.");
  }
});
