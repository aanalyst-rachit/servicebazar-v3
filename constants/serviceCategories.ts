export const SERVICE_CATEGORIES = [
  'Home Services','Cleaning Services','Pest Control','Domestic Help','Patient Care','Packers & Movers',
  'Electrician','Plumber','Carpenter','Painter','AC Services','Appliance Repair','Refrigerator Repair',
  'TV Repair','Washing Machine Repair','Microwave Repair','Water Purifier Services','Generator Repair',
  'Inverter / UPS Services','Mobile Phone Repair','Computer & Laptop Services','Printer Services',
  'CCTV & Security','Security Guards','Interior Designers','Architects','Building Contractors',
  'Waterproofing','Modular Kitchen','False Ceiling','Furniture','Curtains & Blinds','Flooring',
  'Beauty & Personal Care','Salon & Spa','Beauty Parlour','Massage Centres','Makeup Artists','Mehndi Artists',
  'Fitness & Gym','Yoga & Wellness','Photographers & Videographers','Event Organisers','Wedding Planners',
  'Catering Services','Bakeries & Cakes','Food & Tiffin Services','Cooking Services','Party Services',
  'Education & Training','School Tuitions','Coaching & Tuitions','Entrance Exam Coaching',
  'Competitive Exam Coaching','Language Training','Computer Training','Data Science Training',
  'IT & Programming Training','Web Design Training','Career Counselling','Placement Consultancy',
  'Business Services','Consultants','Chartered Accountant','Legal Services','Advocates & Lawyers',
  'Tax Consultants','Company Registration','Digital Marketing','Web & App Services','Graphic Design',
  'Printing Services','Insurance Services','Loans & Finance','Personal Finance','Visa Consultants',
  'Tours & Travels','Tour Operators','Vehicle Rentals','Driving Services','Bike Repair','Car Repair',
  'Automobile Services','Tyre & Wheel Services','Battery Services','Towing Services','Medical / Healthcare',
  'Doctors','Clinics','Hospitals','Pharmacy','Nursing Care','Home Nursing','Physiotherapy',
  'Dental Services','Eye Care','Mental Wellness','Veterinary Services','Astrologers','Pandit / Religious Services',
  'Laundry / Dry Cleaning','Tailoring','Clothing Services','Retail Stores','Grocery','Pharmacy & Medical Store',
  'Electronics & Repair','Internet Services','Real Estate','Property Services','Rental Services',
  'Music & Entertainment','Artists on Hire','Security & Safety','Pet Services','Gardening / Landscaping',
  'Travel & Transport','Courier / Delivery','B2B Services','Manufacturing Services','Wholesale Services',
  'Professional Services','Personal Services','Other'
];

export const SUBCATEGORY_CATALOG: Record<string, string[]> = {
  'Home Services': ['Electrician','Plumber','Carpenter','Painter','Mason','Handyman','Water Tank Cleaning','Home Maintenance','Other'],
  'Cleaning Services': ['Home Cleaning','Office Cleaning','Deep Cleaning','Sofa Cleaning','Bathroom Cleaning','Kitchen Cleaning','Carpet Cleaning','Other'],
  'Beauty & Personal Care': ['Haircut','Hair Styling','Facial','Skin Care','Waxing','Threading','Manicure','Pedicure','Bridal Makeup','Other'],
  'Salon & Spa': ['Haircut','Hair Colour','Hair Spa','Facial','Massage','Shaving','Bridal Makeup','Manicure','Pedicure','Other'],
  'Repair & Services': ['Appliance Repair','Electronics Repair','Mobile Repair','Computer Repair','AC Repair','Other'],
  'Education & Training': ['School Tuition','College Tuition','Competitive Exams','Language Training','Computer Training','Professional Training','Other'],
  'Business Services': ['Consulting','Accounting','Legal','Tax','HR','Digital Marketing','IT Services','Other'],
  'Legal Services': ['Property Law','Family Law','Criminal Law','Corporate Law','Tax Law','Documentation','Other'],
  'Medical / Healthcare': ['Doctor Consultation','Nursing','Physiotherapy','Dental','Eye Care','Home Care','Other'],
  'Automobile Services': ['Bike Repair','Car Repair','Car Wash','Tyre','Battery','Towing','Detailing','Other'],
  'Bike Repair': ['General Service','Engine Repair','Brake Repair','Tyre & Tube','Battery','Washing','Other'],
  'Car Repair': ['General Service','Engine Repair','AC Repair','Brake Repair','Tyre','Battery','Dent & Paint','Other'],
  'Food & Tiffin Services': ['Home Tiffin','Lunch','Dinner','Breakfast','Snacks','Meal Prep','Other'],
  'Catering Services': ['Wedding Catering','Birthday Catering','Corporate Catering','Buffet','Party Catering','Other'],
  'Event Organisers': ['Wedding','Birthday','Corporate Event','Baby Shower','Decoration','Other'],
  'Real Estate': ['Property Sale','Property Rent','Commercial Property','PG / Hostel','Property Consultant','Other'],
  'Insurance Services': ['Life Insurance','Health Insurance','Motor Insurance','Travel Insurance','Business Insurance','Other'],
  'Tours & Travels': ['Tour Package','Flight Booking','Hotel Booking','Cab Booking','Visa Assistance','Other'],
  'Other': ['Other']
};

export const getSubcategories = (category: string): string[] =>
  SUBCATEGORY_CATALOG[category] || [
    'General Service','Consultation','Installation','Repair','Maintenance','Home Visit','On-site Service','Other'
  ];
