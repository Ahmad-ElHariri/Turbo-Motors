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
  