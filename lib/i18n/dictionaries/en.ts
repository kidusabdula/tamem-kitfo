/**
 * The English dictionary is the SOURCE OF TRUTH for the dictionary shape.
 * `am.ts` is typed against it, so a missing Amharic key is a compile error
 * rather than an `undefined` leaking into the UI.
 */
export const en = {
  meta: {
    localeName: 'English',
    switchTo: 'አማርኛ',
  },

  brand: {
    name: 'Tamem Kitfo',
    tagline: 'Famous Gurage Restaurant',
    branch: 'Bole Branch',
  },

  nav: {
    home: 'Home',
    menu: 'Menu',
    catering: 'Catering',
    events: 'Events',
    gallery: 'Gallery',
    contact: 'Contact',
    order: 'Order',
    book: 'Book a Table',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    switchLanguage: 'Switch language',
  },

  actions: {
    viewMenu: 'View the Menu',
    orderNow: 'Order Now',
    bookTable: 'Book a Table',
    addToCart: 'Add',
    inCart: 'In cart',
    remove: 'Remove',
    viewCart: 'View Cart',
    checkout: 'Continue to Order',
    placeOrder: 'Place Order',
    sendMessage: 'Send Message',
    requestQuote: 'Request a Quote',
    inquire: 'Make an Enquiry',
    callUs: 'Call Us',
    directions: 'Get Directions',
    learnMore: 'Learn more',
    back: 'Back',
    seeAll: 'See all',
    submitting: 'Sending…',
    tryAgain: 'Try again',
    continueOnWhatsApp: 'Send on WhatsApp instead',
    copy: 'Copy',
    copied: 'Copied',
  },

  home: {
    heroEyebrow: 'Bole · Addis Ababa',
    heroTitleLine1: 'The home of',
    heroTitleLine2: 'famous kitfo',
    heroBody:
      'Prime beef minced by hand each morning, folded through niter kibbeh we clarify ourselves, and served the way Gurage families have served it for generations.',
    scrollHint: 'Scroll',

    pillarsEyebrow: 'More than kitfo',
    pillarsTitle: 'What we are known for',
    pillars: {
      kitfo: {
        title: 'Hand-minced kitfo',
        body: 'Tire, leb-leb or fully cooked — prepared to order with our own spiced butter and mitmita.',
      },
      bulla: {
        title: 'Bulla, genfo & dulet',
        body: 'The Gurage table in full: silky enset bulla, rich genfo, and dulet chopped fresh each service.',
      },
      mesob: {
        title: 'Mesob dining',
        body: 'Traditional low tables and hand-woven mesob for family gatherings and long lunches.',
      },
      catering: {
        title: 'Catering to you',
        body: 'We bring the clay pans, the chefs and the coffee ceremony to your home or office.',
      },
    },

    storyEyebrow: 'Tradition & heritage',
    storyTitle: 'A Gurage kitchen in the middle of Bole',
    storyBody1:
      'Kitfo is not a dish you can rush. The beef is trimmed and minced by hand, never machine-ground, because the texture is the whole point. The niter kibbeh is clarified in our own kitchen with korerima and koseret, and the mitmita comes up from Gurage growers who have sold to this family for years.',
    storyBody2:
      'Everything else follows from that. Warm kocho instead of bread. Fresh ayib, not yesterday’s. Gomen cooked down slowly. It is the same food our grandmothers made, served in a room where you are expected to stay a while.',
    storyPoints: {
      butter: 'Niter kibbeh clarified in-house',
      beef: 'Prime beef minced fresh daily',
      spice: 'Mitmita sourced from Gurage growers',
      clay: 'Served in traditional clay and mesob',
    },

    signatureEyebrow: 'From the menu',
    signatureTitle: 'Order a plate',
    signatureBody: 'A few of the dishes people come back for. The full menu has more.',

    cateringEyebrow: 'Mobile catering',
    cateringTitle: 'We will bring it to you',
    cateringBody:
      'Weddings, mahiber, office lunches and family days. Our chefs mix the kitfo in front of your guests, and the coffee ceremony runs to the end.',

    eventsEyebrow: 'Events & gatherings',
    eventsTitle: 'A hall built for celebrations',
    eventsBody:
      'Our cultural hall seats a large party under woven walls and warm light, with mesob seating and a full coffee ceremony set.',

    galleryEyebrow: 'The room',
    galleryTitle: 'Come and see',

    visitEyebrow: 'Find us',
    visitTitle: 'Open every day',
  },

  menu: {
    title: 'Our Menu',
    eyebrow: 'Taste the heritage',
    intro:
      'Prices are in Ethiopian Birr. Kitfo can be prepared tire, leb-leb or fully cooked — just tell us how you like it.',
    allItems: 'All dishes',
    empty: 'No dishes in this category yet.',
    unavailable: 'Not available today',
    popular: 'Popular',
    spiceLabel: 'Spice',
    spice: ['Mild', 'Gentle heat', 'Properly spicy', 'Very hot'],
    ordersClosedTitle: 'Online ordering is paused',
    ordersClosedBody:
      'We are not taking online orders at the moment. Please call us and we will look after you.',
  },

  cart: {
    title: 'Your Order',
    empty: 'Your order is empty.',
    emptyHint: 'Add something from the menu to get started.',
    subtotal: 'Subtotal',
    total: 'Total',
    itemsOne: 'item',
    itemsOther: 'items',
    note: 'Payment is made in person. We will call you to confirm before we start cooking.',
  },

  order: {
    title: 'Complete your order',
    eyebrow: 'Almost there',
    fulfilment: 'How would you like it?',
    fulfilmentOptions: {
      dine_in: 'Dine in',
      pickup: 'Collect from us',
      delivery: 'Delivery',
    },
    fulfilmentHints: {
      dine_in: 'We will hold a table for you.',
      pickup: 'Ready at the counter at your chosen time.',
      delivery: 'Within Bole and nearby. We will confirm the fee by phone.',
    },
    name: 'Your name',
    phone: 'Phone number',
    phoneHint: 'We call this number to confirm. Ethiopian numbers only.',
    when: 'When do you need it?',
    whenAsap: 'As soon as possible',
    address: 'Delivery address',
    addressHint: 'Building, floor, and a landmark if you can.',
    notes: 'Anything we should know?',
    notesHint: 'Allergies, spice level, how you want the kitfo prepared.',
    successTitle: 'Order received',
    successBody:
      'We have sent this straight to the kitchen. Someone will call you shortly to confirm.',
    yourCode: 'Your order code',
    codeHint: 'Keep this. Quote it when you call or collect.',
    lookupTitle: 'Order status',
    lookupNotFound: 'We could not find that order. Check the code and try again.',
    status: {
      new: 'Received',
      confirmed: 'Confirmed',
      preparing: 'Being prepared',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
  },

  book: {
    title: 'Book a table',
    eyebrow: 'Reservations',
    intro:
      'Tell us when and how many, and we will hold a table. For large groups, use the events form instead.',
    partySize: 'How many people?',
    when: 'Date and time',
    notes: 'Special requests',
    notesHint: 'Birthday, mesob seating, a quiet corner — tell us.',
    successTitle: 'Table requested',
    successBody: 'We will call you shortly to confirm your table.',
  },

  catering: {
    title: 'Catering',
    eyebrow: 'We come to you',
    heroBody:
      'From a twenty-person office lunch to a full wedding, we bring the kitchen, the clay pans and the ceremony.',
    features: {
      live: {
        title: 'Chefs on site',
        body: 'The kitfo is mixed in front of your guests, not packed in a van two hours earlier.',
      },
      ware: {
        title: 'Full traditional service',
        body: 'Clay pans, mesob baskets, ayib bowls and injera brought fresh on the day.',
      },
      coffee: {
        title: 'Coffee ceremony',
        body: 'Green beans roasted in the room, with frankincense and popcorn, run properly to three rounds.',
      },
    },
    formTitle: 'Tell us about your event',
    eventType: 'What is the occasion?',
    eventTypes: {
      wedding: 'Wedding',
      mahiber: 'Mahiber',
      corporate: 'Corporate / office',
      birthday: 'Birthday',
      memorial: 'Memorial',
      other: 'Something else',
    },
    eventDate: 'Date of the event',
    guestCount: 'Roughly how many guests?',
    location: 'Where is it?',
    message: 'Anything else',
    email: 'Email (optional)',
    successTitle: 'Enquiry sent',
    successBody: 'Our catering team will call you to talk through the menu and pricing.',
  },

  events: {
    title: 'Events & gatherings',
    eyebrow: 'The hall',
    heroBody:
      'A long cultural hall with woven walls, carved seating and warm overhead light — built for the kind of gathering that runs late.',
    spaces: {
      hall: {
        title: 'Cultural hall',
        body: 'Our largest space, laid out with traditional carved chairs and low tables, with a full coffee ceremony set at the entrance.',
      },
      mesob: {
        title: 'Mesob lounge',
        body: 'A smaller, more private corner with hand-woven mesob tables — right for a family celebration or a closed meeting.',
      },
      terrace: {
        title: 'Garden terrace',
        body: 'Open-air seating under the bougainvillea, good for daytime gatherings and coffee.',
      },
    },
    ctaTitle: 'Planning something?',
    ctaBody: 'Tell us the date and the number of guests and we will hold the space.',
  },

  gallery: {
    title: 'Gallery',
    eyebrow: 'Tamem moments',
    filters: {
      all: 'Everything',
      food: 'Dishes',
      dining: 'The rooms',
      events: 'Gatherings',
      drinks: 'Bar & tej',
    },
    empty: 'No photographs here yet.',
  },

  contact: {
    title: 'Visit us',
    eyebrow: 'Location & contact',
    getInTouch: 'Get in touch',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    hours: 'Opening hours',
    openNow: 'Open now',
    closedNow: 'Closed now',
    everyDay: 'Every day',
    mapCta: 'Open in Google Maps',
    formTitle: 'Send us a message',
    yourMessage: 'Your message',
    successTitle: 'Message sent',
    successBody: 'Thank you. We will get back to you soon.',
  },

  form: {
    required: 'Required',
    optional: 'Optional',
    errorTitle: 'Something went wrong',
    errorBody: 'We could not send that. Please try again, or call us directly.',
    rateLimited: 'That is a lot of requests at once. Please wait a moment and try again.',
    validation: {
      nameRequired: 'Please tell us your name',
      nameTooShort: 'That name looks too short',
      phoneRequired: 'We need a phone number to confirm',
      phoneInvalid: 'Enter a valid Ethiopian number, e.g. 0911 123 456',
      emailInvalid: 'That email address does not look right',
      messageRequired: 'Please write a short message',
      dateRequired: 'Please choose a date',
      dateInPast: 'Please choose a date in the future',
      guestsRequired: 'Roughly how many guests?',
      guestsRange: 'Enter a number between 1 and 2000',
      partyRange: 'Enter a number between 1 and 40',
      addressRequired: 'We need an address to deliver',
      cartEmpty: 'Your order is empty',
      locationRequired: 'Where should we come to?',
    },
  },

  footer: {
    blurb: 'The taste that made us famous.',
    explore: 'Explore',
    visit: 'Visit',
    rights: 'All rights reserved.',
    staffLogin: 'Staff',
  },

  a11y: {
    skipToContent: 'Skip to content',
    loading: 'Loading',
    increaseQuantity: 'Increase quantity',
    decreaseQuantity: 'Decrease quantity',
  },

  notFound: {
    title: 'This page does not exist',
    body: 'The link may be old, or we may have moved the page.',
    cta: 'Back to the homepage',
  },

  admin: {
    title: 'Tamem Kitfo — Staff',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    signOut: 'Sign out',
    email: 'Email',
    password: 'Password',
    signInError: 'That email and password did not match. Please try again.',
    notConfigured:
      'The database is not connected yet. Add the Supabase keys to .env.local, then reload.',
    notStaff:
      'This account is signed in but has not been added as staff yet. Ask the owner to add you.',
    loading: 'Loading…',
    saveFailed: 'Could not save. Please try again.',
    languageLabel: 'Language',
    backToSite: 'View the site',

    nav: {
      dashboard: 'Today',
      orders: 'Orders',
      catering: 'Catering',
      bookings: 'Bookings',
      menu: 'Menu',
      gallery: 'Gallery',
      content: 'Text',
      settings: 'Settings',
    },

    dashboard: {
      title: 'Today at a glance',
      newOrders: 'New orders',
      todayOrders: 'Orders today',
      openInquiries: 'Open catering inquiries',
      upcomingBookings: 'Upcoming bookings',
      revenueToday: 'Ordered today',
      nothingYet: 'Nothing yet today.',
      telegramHint:
        'Orders also arrive in your Telegram group, where you can confirm them without opening this page.',
      recentOrders: 'Latest orders',
      viewAll: 'See all',
    },

    orders: {
      title: 'Orders',
      code: 'Code',
      customer: 'Customer',
      items: 'Items',
      total: 'Total',
      when: 'Placed',
      scheduledFor: 'Wanted for',
      type: 'Type',
      status: 'Status',
      address: 'Address',
      notes: 'Notes',
      filterAll: 'All',
      updated: 'Updated',
      empty: 'No orders yet.',
      call: 'Call',
    },

    catering: {
      title: 'Catering inquiries',
      event: 'Event',
      date: 'Date',
      guests: 'Guests',
      location: 'Location',
      message: 'Message',
      status: 'Status',
      empty: 'No inquiries yet.',
      statuses: {
        new: 'New',
        contacted: 'Contacted',
        quoted: 'Quoted',
        won: 'Booked',
        lost: 'Lost',
      },
    },

    bookings: {
      title: 'Table bookings',
      party: 'Party',
      when: 'When',
      notes: 'Notes',
      status: 'Status',
      empty: 'No bookings yet.',
      statuses: {
        new: 'New',
        confirmed: 'Confirmed',
        seated: 'Seated',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },

    menu: {
      title: 'Menu',
      addDish: 'Add a dish',
      editDish: 'Edit dish',
      newDish: 'New dish',
      nameEn: 'Name (English)',
      nameAm: 'Name (Amharic)',
      descriptionEn: 'Description (English)',
      descriptionAm: 'Description (Amharic)',
      price: 'Price (ETB)',
      category: 'Category',
      spice: 'Spice level',
      available: 'On the menu',
      popular: 'Show on the homepage',
      image: 'Photo',
      upload: 'Upload a photo',
      uploading: 'Uploading…',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Delete this dish? Past orders keep their own record of it.',
      empty: 'No dishes yet.',
      hidden: 'Hidden',
    },

    gallery: {
      title: 'Gallery',
      upload: 'Add photos',
      uploading: 'Uploading…',
      altEn: 'Description (English)',
      altAm: 'Description (Amharic)',
      category: 'Category',
      published: 'Visible',
      empty: 'No photos yet.',
      confirmDelete: 'Remove this photo from the gallery?',
    },

    content: {
      title: 'Text',
      intro:
        'These override the text built into the site. Leave one blank and the built-in wording is used.',
      key: 'Where it appears',
      valueEn: 'English',
      valueAm: 'Amharic',
      reset: 'Use the built-in text',
      empty: 'Nothing overridden yet.',
    },

    settings: {
      title: 'Settings',
      phones: 'Phone numbers',
      phonesHint: 'One per line. The first is used for the “Call” buttons.',
      whatsapp: 'WhatsApp number',
      email: 'Email',
      addressEn: 'Address (English)',
      addressAm: 'Address (Amharic)',
      mapUrl: 'Google Maps link',
      hours: 'Opening hours',
      hoursHint: 'Leave a day blank to show it as closed.',
      acceptingOrders: 'Accepting online orders',
      acceptingHint:
        'Turn this off and the order button is replaced with a note asking people to call. Use it when the kitchen is full.',
      deliveryNoteEn: 'Delivery note (English)',
      deliveryNoteAm: 'Delivery note (Amharic)',
      closed: 'Closed',
      opens: 'Opens',
      closes: 'Closes',
    },
  },
}

export type Dictionary = typeof en
