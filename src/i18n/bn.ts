const bn = {
  translation: {
    // App info
    appName: 'Smart Bhumi | LandProof',
    tagline: 'স্মার্ট ভূমি সেবা — সহজে জমির দলিল ও খতিয়ান যাচাই করুন আত্মবিশ্বাসের সঙ্গে।',
    hackathonBadge: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | ভূমি মন্ত্রণালয়',
    demoDisclaimer: 'ডিজিটাল ভূমি সেবা ও ক্যাডাস্ট্রাল ভেরিফিকেশন সিস্টেম',
    demoDisclaimerLong: 'জাতীয় ভূমি ব্যবস্থাপনা ও দলিল অখণ্ডতা নেটওয়ার্ক — ক্রিপ্টোগ্রাফিক সুরক্ষা ও এনআইডি সমন্বিত রেকর্ড।',
    notLegalDocument: 'স্মার্ট ভূমি সেবা ডিজিটাল প্ল্যাটফর্ম',

    // Navigation
    nav: {
      home: 'হোম',
      dashboard: 'ড্যাশবোর্ড',
      search: 'অনুসন্ধান',
      register: 'নিবন্ধন',
      verify: 'দলিল যাচাই',
      map: 'মানচিত্র',
      history: 'ইতিহাস',
      flagged: 'পর্যালোচনা',
      logout: 'লগআউট',
      language: 'English',
    },

    // Login
    login: {
      title: 'স্মার্ট ভূমি পোর্টালে প্রবেশ করুন',
      subtitle: 'ভূমিকা ও পরিচিতি নির্বাচন করুন',
      selectRole: 'আপনার নির্ধারিত প্রাতিষ্ঠানিক বা নাগরিক পরিচিতি দিয়ে প্রবেশ করুন',
      roles: {
        citizen: 'জমি মালিক / নাগরিক',
        citizenDesc: 'নিজের জমি ও পর্চা দেখুন, খাজনা প্রদান করুন, দলিলের সত্যতা যাচাই করুন',
        officer: 'সাব-রেজিস্ট্রার (নিবন্ধন কর্মকর্তা)',
        officerDesc: 'দলিল নিবন্ধন সম্পাদন, রাজস্ব ও ই-স্ট্যাম্প যাচাই, ডিজিটাল সিলমোহর প্রদান',
        reviewer: 'সহকারী কমিশনার - ভূমি (এসি ল্যান্ড)',
        reviewerDesc: 'নামজারি (ই-মিউটেশন) শুনানি, খতিয়ান সংশোধন ও বিরোধ নিষ্পত্তি',
        admin: 'মহাপরিচালক / সিস্টেম প্রশাসক',
        adminDesc: 'জাতীয় লেজার অখণ্ডতা, এআই জালিয়াতি রাডার, জরুরি জমি হস্তান্তর লক',
      },
      enterAs: 'হিসেবে প্রবেশ করুন',
      demoNote: 'যাচাই ও পর্যালোচনার সুবিধার্থে নিচে নির্ধারিত প্রোফাইলগুলোর মাধ্যমে সরাসরি প্রবেশ করা যাবে',
    },

    // Landing
    landing: {
      heroTitle: 'আপনার জমির দলিল যাচাই করুন',
      heroSubtitle: 'ক্রিপ্টোগ্রাফিক ডকুমেন্ট ফিঙ্গারপ্রিন্ট এবং মালিকানা সামঞ্জস্য পরীক্ষার মাধ্যমে জমির দলিলের সত্যতা যাচাই করুন।',
      verifyNow: 'এখনই যাচাই করুন',
      exploreMap: 'মানচিত্র দেখুন',
      loginToStart: 'শুরু করতে প্রবেশ করুন',
      features: {
        title: 'প্রধান বৈশিষ্ট্যসমূহ',
        hash: {
          title: 'ডকুমেন্ট ফিঙ্গারপ্রিন্ট',
          desc: 'SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ ব্যবহার করে দলিলের অখণ্ডতা যাচাই করুন',
        },
        qr: {
          title: 'QR কোড যাচাই',
          desc: 'QR কোড স্ক্যান করে তাৎক্ষণিকভাবে রেকর্ড দেখুন এবং যাচাই করুন',
        },
        ownership: {
          title: 'মালিকানা সামঞ্জস্য',
          desc: 'বিক্রেতার তথ্য নিবন্ধিত মালিকের সাথে তুলনা করে অসঙ্গতি চিহ্নিত করুন',
        },
        map: {
          title: 'ইন্টারেক্টিভ মানচিত্র',
          desc: 'বাংলাদেশের মানচিত্রে ডেমো ভূমি রেকর্ডের অবস্থান দেখুন',
        },
      },
    },

    // Dashboard
    dashboard: {
      title: 'ড্যাশবোর্ড',
      welcome: 'স্বাগতম',
      metrics: {
        totalRecords: 'মোট রেকর্ড',
        verifiedDocs: 'সফল যাচাই',
        mismatches: 'অমিল',
        unknownAttempts: 'অজানা রেকর্ড',
        reviewCases: 'পর্যালোচনা প্রয়োজন',
        totalEvents: 'মোট কার্যক্রম',
      },
      quickActions: {
        title: 'দ্রুত কার্যক্রম',
        register: 'নতুন দলিল নিবন্ধন',
        verify: 'দলিল যাচাই করুন',
        search: 'রেকর্ড অনুসন্ধান',
        viewMap: 'মানচিত্র দেখুন',
        viewFlagged: 'পতাকাঙ্কিত রেকর্ড',
        resetDemo: 'ডেমো ডেটা রিসেট',
      },
      recentActivity: 'সাম্প্রতিক কার্যক্রম',
      noActivity: 'এখনো কোনো কার্যক্রম নেই',
    },

    // Search
    search: {
      title: 'ভূমি রেকর্ড অনুসন্ধান',
      subtitle: 'বিভাগ, জেলা, উপজেলা, মৌজা বা দলিল নম্বর দিয়ে অনুসন্ধান করুন',
      keyword: 'কীওয়ার্ড দিয়ে অনুসন্ধান',
      keywordPlaceholder: 'দলিল নম্বর, মৌজা, মালিক...',
      filters: 'ফিল্টার',
      clearFilters: 'ফিল্টার মুছুন',
      results: 'অনুসন্ধান ফলাফল',
      resultCount: '{{count}}টি রেকর্ড পাওয়া গেছে',
      noResults: 'কোনো রেকর্ড পাওয়া যায়নি',
      noResultsHint: 'অন্য মানদণ্ড দিয়ে অনুসন্ধান করুন অথবা ফিল্টার পরিবর্তন করুন',
      loading: 'অনুসন্ধান হচ্ছে...',
      viewDetails: 'বিস্তারিত দেখুন',
      verifyThis: 'যাচাই করুন',
    },

    // Fields
    fields: {
      division: 'বিভাগ',
      district: 'জেলা',
      upazila: 'উপজেলা/থানা',
      mouza: 'মৌজা',
      jlNumber: 'জে.এল. নম্বর',
      khatianType: 'খতিয়ানের ধরন',
      khatianNumber: 'খতিয়ান নম্বর',
      dagNumber: 'দাগ নম্বর',
      deedNumber: 'দলিল নম্বর',
      deedType: 'দলিলের ধরন',
      landArea: 'জমির পরিমাণ',
      landAreaUnit: 'একক',
      landClassification: 'জমির শ্রেণি',
      registrationDate: 'নিবন্ধনের তারিখ',
      sellerRef: 'বিক্রেতা রেফারেন্স',
      buyerRef: 'ক্রেতা রেফারেন্স',
      ownerRef: 'মালিকানা রেফারেন্স',
      surveyType: 'জরিপের ধরন',
      documentHash: 'ডকুমেন্ট ফিঙ্গারপ্রিন্ট (SHA-256)',
      status: 'অবস্থা',
      createdAt: 'তৈরির তারিখ',
      notes: 'অভ্যন্তরীণ ডেমো নোট',
      selectOption: 'নির্বাচন করুন',
      all: 'সকল',
    },

    // Units
    units: {
      decimal: 'শতাংশ',
      acre: 'একর',
      katha: 'কাঠা',
      bigha: 'বিঘা',
    },

    // Survey types
    surveys: {
      CS: 'সি.এস. (কেডাস্ট্রাল সার্ভে)',
      SA: 'এস.এ. (স্টেট অ্যাকুইজিশন সার্ভে)',
      RS: 'আর.এস. (রিভিশনাল সার্ভে)',
      BS: 'বি.এস. (বাংলাদেশ সার্ভে)',
    },

    // Khatian types
    khatianTypes: {
      CS: 'সি.এস. খতিয়ান',
      SA: 'এস.এ. খতিয়ান',
      RS: 'আর.এস. খতিয়ান',
      BS: 'বি.এস. খতিয়ান',
      city: 'সিটি জরিপ খতিয়ান',
    },

    // Deed types
    deedTypes: {
      sale: 'বিক্রয় দলিল',
      gift: 'হেবা/দান দলিল',
      inheritance: 'উত্তরাধিকার দলিল',
      exchange: 'বিনিময় দলিল',
      mortgage: 'বন্ধকী দলিল',
    },

    // Land classifications
    landClass: {
      agricultural: 'কৃষি জমি',
      residential: 'আবাসিক জমি',
      commercial: 'বাণিজ্যিক জমি',
      industrial: 'শিল্প জমি',
      wetland: 'জলাভূমি',
    },

    // Register
    register: {
      title: 'সিন্থেটিক দলিল নিবন্ধন',
      subtitle: 'একটি নতুন ডেমো ভূমি দলিল নিবন্ধন করুন',
      steps: {
        location: 'অবস্থান তথ্য',
        record: 'রেকর্ড তথ্য',
        parties: 'পক্ষসমূহ',
        document: 'দলিল আপলোড',
        review: 'পর্যালোচনা ও নিশ্চিতকরণ',
      },
      uploadDoc: 'দলিল আপলোড করুন',
      uploadHint: 'PDF, JPG, PNG — সর্বোচ্চ ১০ MB',
      dragDrop: 'এখানে ফাইল টেনে আনুন অথবা ক্লিক করুন',
      calculating: 'ফিঙ্গারপ্রিন্ট গণনা হচ্ছে...',
      submit: 'দলিল নিবন্ধন করুন',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      success: {
        title: 'দলিল সফলভাবে নিবন্ধিত হয়েছে!',
        message: 'আপনার ডেমো দলিল নিবন্ধন সম্পন্ন হয়েছে। নিচে রেকর্ডের তথ্য এবং QR কোড দেখুন।',
        deedRef: 'দলিল রেফারেন্স',
        hash: 'ডকুমেন্ট ফিঙ্গারপ্রিন্ট',
        hashExplain: 'এটি আপলোড করা ফাইলের SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ। এই অনন্য ফিঙ্গারপ্রিন্ট পরবর্তীতে ফাইলটি অপরিবর্তিত আছে কিনা তা যাচাই করতে ব্যবহার করা হবে।',
        qrCode: 'QR কোড',
        qrExplain: 'এই QR কোড স্ক্যান করে সরাসরি এই রেকর্ডের যাচাই পৃষ্ঠায় যেতে পারবেন।',
        viewRecord: 'রেকর্ড দেখুন',
        registerAnother: 'আরেকটি নিবন্ধন করুন',
        goToDashboard: 'ড্যাশবোর্ডে যান',
      },
      errors: {
        required: 'এই ক্ষেত্রটি আবশ্যক',
        invalidFile: 'অবৈধ ফাইল ফরম্যাট। PDF, JPG, বা PNG ফাইল আপলোড করুন',
        fileTooLarge: 'ফাইলের আকার ১০ MB-র বেশি হতে পারে না',
        registrationFailed: 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন',
      },
    },

    // Verify
    verify: {
      title: 'দলিল যাচাই',
      subtitle: 'দলিল রেফারেন্স দিয়ে অনুসন্ধান করুন বা QR কোড ব্যবহার করুন',
      searchByRef: 'দলিল রেফারেন্স দিয়ে অনুসন্ধান',
      refPlaceholder: 'উদাহরণ: LP-2026-001',
      searchBtn: 'অনুসন্ধান',
      orScanQR: 'অথবা QR কোড স্ক্যান করুন',
      recordFound: 'রেকর্ড পাওয়া গেছে',
      uploadForVerify: 'যাচাইয়ের জন্য দলিল আপলোড করুন',
      uploadHint: 'নিবন্ধনের সময় আপলোড করা মূল ফাইলটি এখানে আপলোড করুন',
      verifyBtn: 'দলিল যাচাই করুন',
      verifying: 'যাচাই হচ্ছে...',

      results: {
        title: 'যাচাই ফলাফল',
        verified: 'যাচাই সফল',
        verifiedExplain: 'আপলোড করা ফাইলের SHA-256 ফিঙ্গারপ্রিন্ট নিবন্ধিত ফিঙ্গারপ্রিন্টের সাথে মিলে গেছে। এর অর্থ ফাইলটি নিবন্ধনের পর পরিবর্তিত হয়নি।',
        verifiedNote: 'গুরুত্বপূর্ণ: এই যাচাই শুধুমাত্র ফাইলের অখণ্ডতা প্রমাণ করে। এটি আইনি মালিকানা বা দলিলের আইনি সত্যতা নিশ্চিত করে না।',
        mismatch: 'অমিল সনাক্ত হয়েছে',
        mismatchExplain: 'আপলোড করা ফাইলের ফিঙ্গারপ্রিন্ট নিবন্ধিত ফিঙ্গারপ্রিন্টের সাথে মিলে না। ফাইলটি নিবন্ধনের পর পরিবর্তিত হয়ে থাকতে পারে।',
        notFound: 'রেকর্ড পাওয়া যায়নি',
        notFoundExplain: 'প্রদত্ত রেফারেন্সে কোনো রেকর্ড পাওয়া যায়নি। রেফারেন্স নম্বরটি সঠিক কিনা পরীক্ষা করুন।',
        manualReview: 'ম্যানুয়াল পর্যালোচনা প্রয়োজন',
        manualReviewExplain: 'রেকর্ডে অসঙ্গতি সনাক্ত হয়েছে। নিচে বিস্তারিত দেখুন।',
        ownershipMatch: 'মালিকানা সামঞ্জস্য পরীক্ষা: সফল',
        ownershipMatchExplain: 'বিক্রেতার রেফারেন্স নিবন্ধিত মালিকের রেফারেন্সের সাথে মিলে গেছে।',
        ownershipMismatch: 'মালিকানা অসঙ্গতি সনাক্ত',
        ownershipMismatchExplain: 'বিক্রেতার রেফারেন্স ({{seller}}) নিবন্ধিত মালিকের রেফারেন্স ({{owner}}) এর সাথে মিলছে না। এটি ম্যানুয়াল পর্যালোচনা প্রয়োজন।',
        ownershipNotFound: 'মালিকানা রেফারেন্স পাওয়া যায়নি',
        ownershipNotFoundExplain: 'এই প্লটের জন্য মালিকানা রেফারেন্স ডাটাবেসে পাওয়া যায়নি। ম্যানুয়াল পর্যালোচনা প্রয়োজন।',
        expectedHash: 'প্রত্যাশিত ফিঙ্গারপ্রিন্ট',
        uploadedHash: 'আপলোডকৃত ফিঙ্গারপ্রিন্ট',
      },
    },

    // Record details
    record: {
      title: 'রেকর্ড বিস্তারিত',
      sections: {
        overview: 'রেকর্ড সারসংক্ষেপ',
        location: 'অবস্থান ও জরিপ তথ্য',
        khatianDag: 'খতিয়ান ও দাগ তথ্য',
        deed: 'দলিলের তথ্য',
        parties: 'বিক্রেতা ও ক্রেতা তথ্য',
        ownership: 'নিবন্ধিত মালিকানা রেফারেন্স',
        document: 'ডকুমেন্ট ফিঙ্গারপ্রিন্ট',
        verification: 'যাচাই ইতিহাস',
        qr: 'QR কোড যাচাই',
        warnings: 'সতর্কতা ও পর্যালোচনা অবস্থা',
      },
      verifyDocument: 'এই দলিল যাচাই করুন',
      downloadSample: 'নমুনা ফাইল ডাউনলোড',
      noVerifications: 'এখনো কোনো যাচাই হয়নি',
    },

    // Map
    map: {
      title: 'ভূমি রেকর্ড মানচিত্র',
      subtitle: 'বাংলাদেশের মানচিত্রে ডেমো ভূমি রেকর্ডের অবস্থান দেখুন',
      legend: 'মানচিত্র কিংবদন্তি',
      demoLocation: 'ডেমো অবস্থান — প্রকৃত জমির সীমানা নয়',
      selectRecord: 'একটি রেকর্ড নির্বাচন করুন',
      recordDetails: 'রেকর্ড বিস্তারিত',
      filterByDivision: 'বিভাগ অনুযায়ী ফিল্টার',
      verified: 'যাচাইকৃত',
      unverified: 'অযাচাইকৃত',
      flagged: 'পতাকাঙ্কিত',
      zoomIn: 'জুম ইন',
      zoomOut: 'জুম আউট',
      noRecords: 'এই এলাকায় কোনো ডেমো রেকর্ড নেই',
      viewRecord: 'রেকর্ড দেখুন',
    },

    // History
    history: {
      title: 'কার্যক্রম ইতিহাস',
      subtitle: 'সকল যাচাই ও নিবন্ধন কার্যক্রমের তালিকা',
      columns: {
        id: 'ইভেন্ট আইডি',
        recordRef: 'রেকর্ড রেফারেন্স',
        eventType: 'ইভেন্টের ধরন',
        timestamp: 'সময়',
        outcome: 'ফলাফল',
        role: 'ভূমিকা',
        reviewStatus: 'পর্যালোচনা অবস্থা',
      },
      eventTypes: {
        registration: 'নিবন্ধন',
        verification: 'যাচাই',
        verificationFailed: 'যাচাই ব্যর্থ',
        unknownLookup: 'অজানা রেকর্ড',
        reviewUpdate: 'পর্যালোচনা আপডেট',
        demoReset: 'ডেমো রিসেট',
      },
      outcomes: {
        success: 'সফল',
        verified: 'যাচাইকৃত',
        mismatch: 'অমিল',
        notFound: 'পাওয়া যায়নি',
        flagged: 'পতাকাঙ্কিত',
        reviewRequired: 'পর্যালোচনা প্রয়োজন',
      },
      noHistory: 'এখনো কোনো কার্যক্রম নেই',
      filter: 'ফিল্টার',
      exportCSV: 'CSV ডাউনলোড',
    },

    // Flagged/Review
    flagged: {
      title: 'পতাকাঙ্কিত রেকর্ড পর্যালোচনা',
      subtitle: 'মালিকানা অসঙ্গতি এবং দলিল অমিলের রেকর্ডসমূহ',
      reason: 'পতাকাঙ্কিত কারণ',
      currentStatus: 'বর্তমান অবস্থা',
      reviewNote: 'পর্যালোচনা নোট',
      reviewNotePlaceholder: 'আপনার পর্যালোচনা মন্তব্য লিখুন...',
      updateStatus: 'অবস্থা আপডেট করুন',
      statuses: {
        new: 'নতুন',
        underReview: 'পর্যালোচনাধীন',
        additionalReview: 'অতিরিক্ত যাচাই প্রয়োজন',
        completed: 'পর্যালোচনা সম্পন্ন',
      },
      noFlagged: 'কোনো পতাকাঙ্কিত রেকর্ড নেই',
      viewRecord: 'রেকর্ড দেখুন',
      checks: {
        documentIntegrity: 'দলিলের অখণ্ডতা',
        ownershipConsistency: 'মালিকানা সামঞ্জস্য',
        passed: 'সফল',
        failed: 'ব্যর্থ',
      },
    },

    // Common
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'একটি ত্রুটি ঘটেছে',
      retry: 'আবার চেষ্টা করুন',
      cancel: 'বাতিল',
      confirm: 'নিশ্চিত করুন',
      save: 'সংরক্ষণ',
      delete: 'মুছুন',
      edit: 'সম্পাদনা',
      close: 'বন্ধ',
      back: 'ফিরে যান',
      yes: 'হ্যাঁ',
      no: 'না',
      ok: 'ঠিক আছে',
      search: 'অনুসন্ধান',
      download: 'ডাউনলোড',
      upload: 'আপলোড',
      print: 'প্রিন্ট',
      reset: 'রিসেট',
      of: 'এর',
      noData: 'কোনো তথ্য নেই',
      seeAll: 'সব দেখুন',
    },

    // Footer
    footer: {
      disclaimer: 'ভূমি মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ডিজিটাল ভূমি সেবা প্ল্যাটফর্ম।',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'ব্যবহারের শর্তাবলি',
      hackathon: 'ভূমি মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
      builtWith: 'ডিজিটাল সার্ভিস টিম',
    },

    // Confirm dialogs
    dialogs: {
      resetTitle: 'ডেমো ডেটা রিসেট করুন',
      resetMessage: 'সকল ডেমো রেকর্ড এবং কার্যক্রম ইতিহাস মুছে যাবে এবং প্রাথমিক নমুনা ডেটা পুনরায় লোড হবে। আপনি কি নিশ্চিত?',
      resetConfirm: 'হ্যাঁ, রিসেট করুন',
      resetCancel: 'না, বাতিল করুন',
    },

    // Toasts
    toasts: {
      registrationSuccess: 'দলিল সফলভাবে নিবন্ধিত হয়েছে',
      verificationComplete: 'যাচাই সম্পন্ন',
      reviewUpdated: 'পর্যালোচনা আপডেট হয়েছে',
      demoReset: 'ডেমো ডেটা সফলভাবে রিসেট হয়েছে',
      errorOccurred: 'একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন',
      fileCopied: 'ফাইল কপি হয়েছে',
      linkCopied: 'লিঙ্ক কপি হয়েছে',
    },

    // Divisions
    divisions: {
      dhaka: 'ঢাকা',
      chittagong: 'চট্টগ্রাম',
      rajshahi: 'রাজশাহী',
      khulna: 'খুলনা',
      barishal: 'বরিশাল',
      sylhet: 'সিলেট',
      rangpur: 'রংপুর',
      mymensingh: 'ময়মনসিংহ',
    },
  },
};

export default bn;
