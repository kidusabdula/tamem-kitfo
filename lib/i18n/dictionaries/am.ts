import type { Dictionary } from './en'

/**
 * አማርኛ. Typed against the English dictionary, so any key added there
 * fails the build here until it is translated. That is deliberate:
 * silent English fallbacks are how bilingual sites rot.
 */
export const am: Dictionary = {
  meta: {
    localeName: 'አማርኛ',
    switchTo: 'English',
  },

  brand: {
    name: 'ታሜም ክትፎ',
    tagline: 'ታዋቂው የጉራጌ ምግብ ቤት',
    branch: 'ቦሌ ቅርንጫፍ',
  },

  nav: {
    home: 'መነሻ',
    menu: 'ምናሌ',
    catering: 'ኬተሪንግ',
    events: 'ዝግጅቶች',
    gallery: 'ፎቶዎች',
    contact: 'አግኙን',
    order: 'ትዕዛዝ',
    book: 'ጠረጴዛ ያስይዙ',
    openMenu: 'ዝርዝሩን ክፈት',
    closeMenu: 'ዝርዝሩን ዝጋ',
    switchLanguage: 'ቋንቋ ቀይር',
  },

  actions: {
    viewMenu: 'ምናሌውን ይመልከቱ',
    orderNow: 'አሁን ይዘዙ',
    bookTable: 'ጠረጴዛ ያስይዙ',
    addToCart: 'ጨምር',
    inCart: 'በትዕዛዝ ውስጥ',
    remove: 'አስወግድ',
    viewCart: 'ትዕዛዝዎን ይመልከቱ',
    checkout: 'ወደ ትዕዛዝ ይቀጥሉ',
    placeOrder: 'ትዕዛዝ ይስጡ',
    sendMessage: 'መልእክት ላክ',
    requestQuote: 'የዋጋ ጥያቄ ያቅርቡ',
    inquire: 'ጥያቄ ያቅርቡ',
    callUs: 'ይደውሉልን',
    directions: 'መንገድ ይመልከቱ',
    learnMore: 'ተጨማሪ ይመልከቱ',
    back: 'ተመለስ',
    seeAll: 'ሁሉንም ይመልከቱ',
    submitting: 'በመላክ ላይ…',
    tryAgain: 'እንደገና ይሞክሩ',
    continueOnWhatsApp: 'በዋትስአፕ ይላኩ',
    copy: 'ቅዳ',
    copied: 'ተቀድቷል',
  },

  home: {
    heroEyebrow: 'ቦሌ · አዲስ አበባ',
    heroTitleLine1: 'የታዋቂው ክትፎ',
    heroTitleLine2: 'መገኛ',
    heroBody:
      'በየቀኑ ጠዋት በእጅ የሚከተፍ ምርጥ የበሬ ሥጋ፣ በራሳችን ኩሽና በሚነጠር ንጥር ቅቤ ተለውሶ፣ የጉራጌ ቤተሰቦች ለትውልዶች ሲያቀርቡት እንደኖሩት ይቀርባል።',
    scrollHint: 'ወደ ታች',

    pillarsEyebrow: 'ከክትፎ በላይ',
    pillarsTitle: 'የምንታወቅበት',
    pillars: {
      kitfo: {
        title: 'በእጅ የተከተፈ ክትፎ',
        body: 'ጥሬ፣ ልብ ልብ ወይም የበሰለ — በራሳችን ንጥር ቅቤና ሚጥሚጣ በትዕዛዝዎ መሠረት ይዘጋጃል።',
      },
      bulla: {
        title: 'ቡላ፣ ገንፎና ዱለት',
        body: 'የተሟላው የጉራጌ ማዕድ፦ ልስልስ ያለ የእንሰት ቡላ፣ የደረጀ ገንፎ፣ እና በየጊዜው ትኩስ የሚከተፍ ዱለት።',
      },
      mesob: {
        title: 'የመሶብ ማዕድ',
        body: 'ለቤተሰብ ስብሰባና ለረጅም ምሳ የሚሆኑ ባህላዊ ጠረጴዛዎችና በእጅ የተሠሩ መሶቦች።',
      },
      catering: {
        title: 'ወደ እርስዎ እናመጣለን',
        body: 'የሸክላ ማብሰያዎቻችንን፣ ሼፎቻችንንና የቡና ሥነ-ሥርዓቱን ወደ ቤትዎ ወይም ቢሮዎ እናመጣለን።',
      },
    },

    storyEyebrow: 'ባህልና ቅርስ',
    storyTitle: 'በቦሌ መሃል የተተከለ የጉራጌ ኩሽና',
    storyBody1:
      'ክትፎ የሚቸኩሉት ምግብ አይደለም። ሥጋው በማሽን ሳይሆን በእጅ ነው የሚከተፈው፤ ምክንያቱም ጣዕሙ ያለው በአከታተፉ ላይ ነው። ንጥር ቅቤው በራሳችን ኩሽና በኮረሪማና በኮሰረት ይነጠራል፤ ሚጥሚጣውም ለዓመታት ከዚህ ቤተሰብ ጋር ሲሠሩ ከኖሩ የጉራጌ አምራቾች ይመጣል።',
    storyBody2:
      'የተቀረው ሁሉ ከዚያ ይከተላል። ከዳቦ ይልቅ ትኩስ ቆጮ። የትናንት ሳይሆን ትኩስ አይብ። ቀስ ብሎ የበሰለ ጎመን። አያቶቻችን ያዘጋጁት ያው ምግብ ነው — ቆይታ በሚጋብዝ ክፍል ውስጥ ይቀርባል።',
    storyPoints: {
      butter: 'ንጥር ቅቤ በራሳችን ኩሽና ይነጠራል',
      beef: 'በየቀኑ ትኩስ የሚከተፍ ምርጥ ሥጋ',
      spice: 'ከጉራጌ አምራቾች የሚመጣ ሚጥሚጣ',
      clay: 'በባህላዊ ሸክላና መሶብ ይቀርባል',
    },

    signatureEyebrow: 'ከምናሌው',
    signatureTitle: 'አንድ ሳህን ይዘዙ',
    signatureBody: 'ሰዎች ተመልሰው ከሚመጡላቸው ጥቂቶቹ። ሙሉው ምናሌ ተጨማሪ አለው።',

    cateringEyebrow: 'ተንቀሳቃሽ ኬተሪንግ',
    cateringTitle: 'ወደ እርስዎ እናደርሰዋለን',
    cateringBody:
      'ሠርግ፣ ማህበር፣ የቢሮ ምሳና የቤተሰብ ቀናት። ሼፎቻችን ክትፎውን በእንግዶችዎ ፊት ያዘጋጃሉ፤ የቡና ሥነ-ሥርዓቱም እስከ መጨረሻው ይካሄዳል።',

    eventsEyebrow: 'ዝግጅቶችና ስብሰባዎች',
    eventsTitle: 'ለበዓላት የተዘጋጀ አዳራሽ',
    eventsBody:
      'ባህላዊ አዳራሻችን በሸማ ግድግዳና በሞቅ ያለ ብርሃን ሥር ብዙ እንግዶችን ያስተናግዳል፤ የመሶብ መቀመጫና ሙሉ የቡና ሥነ-ሥርዓት ዕቃ አለው።',

    galleryEyebrow: 'ክፍሎቻችን',
    galleryTitle: 'መጥተው ይዩ',

    visitEyebrow: 'የት እንዳለን',
    visitTitle: 'በየቀኑ ክፍት ነን',
  },

  menu: {
    title: 'ምናሌያችን',
    eyebrow: 'ቅርሱን ይቅመሱ',
    intro:
      'ዋጋዎች በኢትዮጵያ ብር ናቸው። ክትፎ ጥሬ፣ ልብ ልብ ወይም የበሰለ ሆኖ ሊዘጋጅ ይችላል — እንዴት እንደሚፈልጉ ይንገሩን።',
    allItems: 'ሁሉም ምግቦች',
    empty: 'በዚህ ክፍል ውስጥ ገና ምግብ የለም።',
    unavailable: 'ዛሬ አይገኝም',
    popular: 'ተወዳጅ',
    spiceLabel: 'ቅመም',
    spice: ['ለስላሳ', 'ትንሽ ቅመም', 'ቅመም ያለው', 'በጣም ቅመም'],
    ordersClosedTitle: 'የመስመር ላይ ትዕዛዝ ለጊዜው ተቋርጧል',
    ordersClosedBody: 'በአሁኑ ሰዓት የመስመር ላይ ትዕዛዝ አንቀበልም። እባክዎ ይደውሉልን።',
  },

  cart: {
    title: 'ትዕዛዝዎ',
    empty: 'ትዕዛዝዎ ባዶ ነው።',
    emptyHint: 'ለመጀመር ከምናሌው ይምረጡ።',
    subtotal: 'ድምር',
    total: 'ጠቅላላ',
    itemsOne: 'ዓይነት',
    itemsOther: 'ዓይነቶች',
    note: 'ክፍያ በአካል ይፈጸማል። ማብሰል ከመጀመራችን በፊት ደውለን እናረጋግጣለን።',
  },

  order: {
    title: 'ትዕዛዝዎን ያጠናቅቁ',
    eyebrow: 'ሊጠናቀቅ ነው',
    fulfilment: 'እንዴት ይፈልጋሉ?',
    fulfilmentOptions: {
      dine_in: 'እዚሁ እበላለሁ',
      pickup: 'መጥቼ እወስዳለሁ',
      delivery: 'ዴሊቨሪ',
    },
    fulfilmentHints: {
      dine_in: 'ጠረጴዛ እንይዝልዎታለን።',
      pickup: 'በመረጡት ሰዓት ተዘጋጅቶ ይጠብቅዎታል።',
      delivery: 'በቦሌና በአካባቢው። ዋጋውን በስልክ እናረጋግጣለን።',
    },
    name: 'ስምዎ',
    phone: 'ስልክ ቁጥር',
    phoneHint: 'ለማረጋገጥ በዚህ ቁጥር እንደውላለን። የኢትዮጵያ ቁጥር ብቻ።',
    when: 'መቼ ይፈልጋሉ?',
    whenAsap: 'በተቻለ ፍጥነት',
    address: 'የዴሊቨሪ አድራሻ',
    addressHint: 'ሕንፃ፣ ፎቅ፣ እና በአቅራቢያው የሚታወቅ ቦታ ካለ።',
    notes: 'ማወቅ ያለብን ነገር አለ?',
    notesHint: 'አለርጂ፣ የቅመም መጠን፣ ክትፎው እንዴት እንዲዘጋጅ እንደሚፈልጉ።',
    successTitle: 'ትዕዛዝዎ ደርሶናል',
    successBody: 'በቀጥታ ወደ ኩሽና ልከነዋል። በቅርቡ ደውለን እናረጋግጣለን።',
    yourCode: 'የትዕዛዝዎ ኮድ',
    codeHint: 'ይህንን ይያዙ። ሲደውሉ ወይም ሲወስዱ ይጠቀሙበት።',
    lookupTitle: 'የትዕዛዝ ሁኔታ',
    lookupNotFound: 'ያንን ትዕዛዝ ማግኘት አልቻልንም። ኮዱን አረጋግጠው እንደገና ይሞክሩ።',
    status: {
      new: 'ደርሷል',
      confirmed: 'ተረጋግጧል',
      preparing: 'በመዘጋጀት ላይ',
      completed: 'ተጠናቅቋል',
      cancelled: 'ተሰርዟል',
    },
  },

  book: {
    title: 'ጠረጴዛ ያስይዙ',
    eyebrow: 'የቅድሚያ ማስያዣ',
    intro:
      'መቼና ስንት ሰው እንደሆናችሁ ይንገሩን፤ ጠረጴዛ እንይዝልዎታለን። ለትልቅ ቡድን የዝግጅት ቅጹን ይጠቀሙ።',
    partySize: 'ስንት ሰው ናችሁ?',
    when: 'ቀንና ሰዓት',
    notes: 'ልዩ ጥያቄ',
    notesHint: 'የልደት በዓል፣ የመሶብ መቀመጫ፣ ጸጥ ያለ ጥግ — ይንገሩን።',
    successTitle: 'ጥያቄዎ ደርሶናል',
    successBody: 'ጠረጴዛዎን ለማረጋገጥ በቅርቡ እንደውላለን።',
  },

  catering: {
    title: 'ኬተሪንግ',
    eyebrow: 'ወደ እርስዎ እንመጣለን',
    heroBody:
      'ከሃያ ሰው የቢሮ ምሳ እስከ ሙሉ ሠርግ ድረስ፣ ኩሽናውን፣ የሸክላ ማብሰያውንና ሥነ-ሥርዓቱን ይዘን እንመጣለን።',
    features: {
      live: {
        title: 'ሼፎች በቦታው',
        body: 'ክትፎው በእንግዶችዎ ፊት ይዘጋጃል፤ ከሁለት ሰዓት በፊት ተጭኖ የመጣ አይደለም።',
      },
      ware: {
        title: 'ሙሉ ባህላዊ አገልግሎት',
        body: 'የሸክላ ማብሰያ፣ መሶብ፣ የአይብ ሳህንና ትኩስ እንጀራ በዕለቱ ይቀርባል።',
      },
      coffee: {
        title: 'የቡና ሥነ-ሥርዓት',
        body: 'ጥሬ ቡና በቦታው ተቆልቶ፣ ከዕጣንና ፋንዲሻ ጋር፣ እስከ ሦስተኛው ዙር ይቀርባል።',
      },
    },
    formTitle: 'ስለ ዝግጅትዎ ይንገሩን',
    eventType: 'ምን ዓይነት ዝግጅት ነው?',
    eventTypes: {
      wedding: 'ሠርግ',
      mahiber: 'ማህበር',
      corporate: 'የቢሮ / ድርጅት',
      birthday: 'የልደት በዓል',
      memorial: 'ተዝካር',
      other: 'ሌላ',
    },
    eventDate: 'የዝግጅቱ ቀን',
    guestCount: 'በግምት ስንት እንግዳ?',
    location: 'የት ነው?',
    message: 'ተጨማሪ መረጃ',
    email: 'ኢሜይል (አማራጭ)',
    successTitle: 'ጥያቄዎ ተልኳል',
    successBody: 'የኬተሪንግ ቡድናችን ስለ ምናሌውና ዋጋው ለመነጋገር ይደውልልዎታል።',
  },

  events: {
    title: 'ዝግጅቶችና ስብሰባዎች',
    eyebrow: 'አዳራሹ',
    heroBody:
      'በሸማ ግድግዳ፣ በተቀረጸ መቀመጫና በሞቅ ያለ ብርሃን የተዋበ ረጅም ባህላዊ አዳራሽ — እስከ መሽቱ ለሚቆይ ስብሰባ የተሠራ።',
    spaces: {
      hall: {
        title: 'ባህላዊ አዳራሽ',
        body: 'ትልቁ ቦታችን፤ በባህላዊ የተቀረጹ ወንበሮችና ዝቅተኛ ጠረጴዛዎች የተደራጀ፣ በመግቢያው ሙሉ የቡና ሥነ-ሥርዓት ዕቃ ያለው።',
      },
      mesob: {
        title: 'የመሶብ ማረፊያ',
        body: 'በእጅ በተሠሩ መሶቦች የተዘጋጀ ትንሽና የተለየ ጥግ — ለቤተሰብ በዓል ወይም ለዝግ ስብሰባ የሚሆን።',
      },
      terrace: {
        title: 'የአትክልት በረንዳ',
        body: 'ከቡጋንቪላ ሥር ክፍት አየር መቀመጫ፤ ለቀን ስብሰባና ለቡና ተስማሚ።',
      },
    },
    ctaTitle: 'የሆነ ነገር እያዘጋጁ ነው?',
    ctaBody: 'ቀኑንና የእንግዶቹን ብዛት ይንገሩን፤ ቦታውን እንይዝልዎታለን።',
  },

  gallery: {
    title: 'ፎቶዎች',
    eyebrow: 'የታሜም ቅጽበቶች',
    filters: {
      all: 'ሁሉም',
      food: 'ምግቦች',
      dining: 'ክፍሎቻችን',
      events: 'ስብሰባዎች',
      drinks: 'ባርና ጠጅ',
    },
    empty: 'እስካሁን ፎቶ የለም።',
  },

  contact: {
    title: 'ይጎብኙን',
    eyebrow: 'አድራሻና መገኛ',
    getInTouch: 'ያግኙን',
    address: 'አድራሻ',
    phone: 'ስልክ',
    email: 'ኢሜይል',
    hours: 'የሥራ ሰዓት',
    openNow: 'አሁን ክፍት ነው',
    closedNow: 'አሁን ዝግ ነው',
    everyDay: 'በየቀኑ',
    mapCta: 'በጉግል ካርታ ይክፈቱ',
    formTitle: 'መልእክት ይላኩልን',
    yourMessage: 'መልእክትዎ',
    successTitle: 'መልእክቱ ተልኳል',
    successBody: 'እናመሰግናለን። በቅርቡ እንመልስልዎታለን።',
  },

  form: {
    required: 'ያስፈልጋል',
    optional: 'አማራጭ',
    errorTitle: 'የሆነ ችግር ተፈጥሯል',
    errorBody: 'መላክ አልቻልንም። እባክዎ እንደገና ይሞክሩ ወይም በቀጥታ ይደውሉልን።',
    rateLimited: 'በአንድ ጊዜ ብዙ ጥያቄ ቀርቧል። ትንሽ ቆይተው እንደገና ይሞክሩ።',
    validation: {
      nameRequired: 'እባክዎ ስምዎን ይንገሩን',
      nameTooShort: 'ስሙ በጣም አጭር ይመስላል',
      phoneRequired: 'ለማረጋገጥ ስልክ ቁጥር ያስፈልገናል',
      phoneInvalid: 'ትክክለኛ የኢትዮጵያ ቁጥር ያስገቡ፣ ለምሳሌ 0911 123 456',
      emailInvalid: 'ኢሜይሉ ትክክል አይመስልም',
      messageRequired: 'እባክዎ አጭር መልእክት ይጻፉ',
      dateRequired: 'እባክዎ ቀን ይምረጡ',
      dateInPast: 'እባክዎ ወደፊት ያለ ቀን ይምረጡ',
      guestsRequired: 'በግምት ስንት እንግዳ?',
      guestsRange: 'ከ1 እስከ 2000 ያለ ቁጥር ያስገቡ',
      partyRange: 'ከ1 እስከ 40 ያለ ቁጥር ያስገቡ',
      addressRequired: 'ለማድረስ አድራሻ ያስፈልገናል',
      cartEmpty: 'ትዕዛዝዎ ባዶ ነው',
      locationRequired: 'ወዴት እንምጣ?',
    },
  },

  footer: {
    blurb: 'ያስጠራን ጣዕም።',
    explore: 'ዳስሱ',
    visit: 'ጎብኙን',
    rights: 'መብቱ በሕግ የተጠበቀ ነው።',
    staffLogin: 'ሠራተኞች',
  },

  a11y: {
    skipToContent: 'ወደ ይዘቱ ዝለል',
    loading: 'በመጫን ላይ',
    increaseQuantity: 'ብዛት ጨምር',
    decreaseQuantity: 'ብዛት ቀንስ',
  },

  notFound: {
    title: 'ይህ ገጽ የለም',
    body: 'አገናኙ አሮጌ ሊሆን ይችላል፣ ወይም ገጹን አዙረነው ይሆናል።',
    cta: 'ወደ መነሻ ገጽ ተመለስ',
  },

  admin: {
    title: 'ታሜም ክትፎ — ሠራተኞች',
    signIn: 'ግባ',
    signingIn: 'በመግባት ላይ…',
    signOut: 'ውጣ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    signInError: 'ኢሜይሉና የይለፍ ቃሉ አልተዛመዱም። እባክዎ እንደገና ይሞክሩ።',
    notConfigured:
      'ዳታቤዙ ገና አልተገናኘም። የSupabase ቁልፎችን ወደ .env.local ጨምረው ገጹን እንደገና ይጫኑ።',
    notStaff:
      'ይህ መለያ ገብቷል ነገር ግን እንደ ሠራተኛ ገና አልተመዘገበም። ባለቤቱ እንዲጨምርዎ ይጠይቁ።',
    loading: 'በመጫን ላይ…',
    saveFailed: 'ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    languageLabel: 'ቋንቋ',
    backToSite: 'ድረ-ገጹን ተመልከት',

    nav: {
      dashboard: 'ዛሬ',
      orders: 'ትዕዛዞች',
      catering: 'ግብዣ',
      bookings: 'ቦታ ማስያዝ',
      menu: 'ምናሌ',
      gallery: 'ፎቶዎች',
      content: 'ጽሑፍ',
      settings: 'ቅንብሮች',
    },

    dashboard: {
      title: 'የዛሬው አጭር እይታ',
      newOrders: 'አዲስ ትዕዛዞች',
      todayOrders: 'የዛሬ ትዕዛዞች',
      openInquiries: 'ያልተዘጉ የግብዣ ጥያቄዎች',
      upcomingBookings: 'የሚመጡ ቦታ ማስያዣዎች',
      revenueToday: 'ዛሬ የታዘዘ',
      nothingYet: 'ዛሬ እስካሁን ምንም የለም።',
      telegramHint:
        'ትዕዛዞች ወደ ቴሌግራም ቡድንዎም ይደርሳሉ፤ ይህን ገጽ ሳይከፍቱ እዚያው ማረጋገጥ ይችላሉ።',
      recentOrders: 'የቅርብ ትዕዛዞች',
      viewAll: 'ሁሉንም ተመልከት',
    },

    orders: {
      title: 'ትዕዛዞች',
      code: 'ኮድ',
      customer: 'ደንበኛ',
      items: 'ዕቃዎች',
      total: 'ጠቅላላ',
      when: 'የታዘዘበት',
      scheduledFor: 'የሚፈለግበት',
      type: 'ዓይነት',
      status: 'ሁኔታ',
      address: 'አድራሻ',
      notes: 'ማስታወሻ',
      filterAll: 'ሁሉም',
      updated: 'ተሻሽሏል',
      empty: 'እስካሁን ትዕዛዝ የለም።',
      call: 'ደውል',
    },

    catering: {
      title: 'የግብዣ ጥያቄዎች',
      event: 'ዝግጅት',
      date: 'ቀን',
      guests: 'እንግዶች',
      location: 'ቦታ',
      message: 'መልእክት',
      status: 'ሁኔታ',
      empty: 'እስካሁን ጥያቄ የለም።',
      statuses: {
        new: 'አዲስ',
        contacted: 'ተገናኝቷል',
        quoted: 'ዋጋ ተሰጥቷል',
        won: 'ተይዟል',
        lost: 'አልተሳካም',
      },
    },

    bookings: {
      title: 'የጠረጴዛ ማስያዣዎች',
      party: 'ሰዎች',
      when: 'መቼ',
      notes: 'ማስታወሻ',
      status: 'ሁኔታ',
      empty: 'እስካሁን ማስያዣ የለም።',
      statuses: {
        new: 'አዲስ',
        confirmed: 'ተረጋግጧል',
        seated: 'ተቀምጧል',
        completed: 'ተጠናቅቋል',
        cancelled: 'ተሰርዟል',
      },
    },

    menu: {
      title: 'ምናሌ',
      addDish: 'ምግብ ጨምር',
      editDish: 'ምግብ አስተካክል',
      newDish: 'አዲስ ምግብ',
      nameEn: 'ስም (እንግሊዝኛ)',
      nameAm: 'ስም (አማርኛ)',
      descriptionEn: 'መግለጫ (እንግሊዝኛ)',
      descriptionAm: 'መግለጫ (አማርኛ)',
      price: 'ዋጋ (ብር)',
      category: 'ምድብ',
      spice: 'የቅመም መጠን',
      available: 'በምናሌው ላይ',
      popular: 'በመነሻ ገጽ አሳይ',
      image: 'ፎቶ',
      upload: 'ፎቶ ጫን',
      uploading: 'በመጫን ላይ…',
      save: 'አስቀምጥ',
      saving: 'በማስቀመጥ ላይ…',
      saved: 'ተቀምጧል',
      cancel: 'ተወው',
      delete: 'ሰርዝ',
      confirmDelete: 'ይህን ምግብ ይሰረዝ? ያለፉ ትዕዛዞች የራሳቸውን መዝገብ ይይዛሉ።',
      empty: 'እስካሁን ምግብ የለም።',
      hidden: 'የተደበቀ',
    },

    gallery: {
      title: 'ፎቶዎች',
      upload: 'ፎቶዎች ጨምር',
      uploading: 'በመጫን ላይ…',
      altEn: 'መግለጫ (እንግሊዝኛ)',
      altAm: 'መግለጫ (አማርኛ)',
      category: 'ምድብ',
      published: 'ይታያል',
      empty: 'እስካሁን ፎቶ የለም።',
      confirmDelete: 'ይህ ፎቶ ከማዕከለ-ስዕላቱ ይወገድ?',
    },

    content: {
      title: 'ጽሑፍ',
      intro:
        'እነዚህ በድረ-ገጹ ውስጥ የተሠራውን ጽሑፍ ይተካሉ። ባዶ ከተውት የተሠራው ቃል ይሠራበታል።',
      key: 'የሚታይበት ቦታ',
      valueEn: 'እንግሊዝኛ',
      valueAm: 'አማርኛ',
      reset: 'የተሠራውን ጽሑፍ ተጠቀም',
      empty: 'እስካሁን የተተካ ጽሑፍ የለም።',
    },

    settings: {
      title: 'ቅንብሮች',
      phones: 'ስልክ ቁጥሮች',
      phonesHint: 'በአንድ መስመር አንድ። የመጀመሪያው ለ«ደውል» አዝራሮች ይሠራል።',
      whatsapp: 'የዋትስአፕ ቁጥር',
      email: 'ኢሜይል',
      addressEn: 'አድራሻ (እንግሊዝኛ)',
      addressAm: 'አድራሻ (አማርኛ)',
      mapUrl: 'የጉግል ካርታ አገናኝ',
      hours: 'የሥራ ሰዓት',
      hoursHint: 'አንድ ቀን ባዶ ከተውት እንደተዘጋ ይታያል።',
      acceptingOrders: 'የመስመር ላይ ትዕዛዝ በመቀበል ላይ',
      acceptingHint:
        'ይህን ካጠፉት የትዕዛዝ አዝራሩ በስልክ እንዲደውሉ በሚጠይቅ ማስታወሻ ይተካል። ወጥ ቤቱ ሲጨናነቅ ይጠቀሙበት።',
      deliveryNoteEn: 'የማድረስ ማስታወሻ (እንግሊዝኛ)',
      deliveryNoteAm: 'የማድረስ ማስታወሻ (አማርኛ)',
      closed: 'ዝግ',
      opens: 'ይከፈታል',
      closes: 'ይዘጋል',
    },
  },
}
