// Single source of truth for Sarah's content. Used as offline fallback by the site
// and turned into SQL seed data by scripts/gen-seed.ts. Facts come from the CV only.
export type Lang = 'en' | 'fr' | 'ar' | 'es'
export const LANGS: Lang[] = ['en', 'fr', 'ar', 'es']
export type ML = Record<Lang, string>
export type MLList = Record<Lang, string[]>

export type Category = 'dance' | 'zumba' | 'events' | 'fitness' | 'professional'
export const CATEGORIES: Category[] = ['dance', 'zumba', 'events', 'fitness', 'professional']

export interface Settings {
  siteUrl: string
  name: string
  email: string
  phone: string
  whatsapp: string
  instagram: string
  qrUrl: string
  qrLabel: ML
}
export interface Stat { value: number; suffix: string; label: ML }
export interface Sections {
  hero: { kicker: ML; headline: ML; intro: ML }
  about: { title: ML; body: ML; location: ML; nationality: ML; relocation: ML; stats: Stat[] }
  dance: { intro: ML }
  contact: { intro: ML }
}
export interface Experience {
  id: string; role: ML; company: ML; location: ML; period: string; bullets: MLList; sort_order: number; visible: boolean
}
export interface Education {
  id: string; title: ML; institution: ML; period: string; kind: 'degree' | 'certification'; sort_order: number; visible: boolean
}
export interface Skill { id: string; name: ML; category: 'care' | 'operations' | 'office'; sort_order: number; visible: boolean }
export interface Language { id: string; name: ML; level: ML; sort_order: number; visible: boolean }
export interface SocialLink { id: string; platform: string; url: string; label: ML; sort_order: number; visible: boolean }
export interface PortfolioItem {
  id: string
  kind: 'image' | 'video'
  src: string
  poster: string | null
  thumb: string | null
  title: ML
  description: ML
  caption: ML
  category: Category
  sort_order: number
  featured: boolean
  visible: boolean
  is_illustration: boolean
}

const m = (en: string, fr: string, ar: string, es: string): ML => ({ en, fr, ar, es })

export const SITE_URL_FALLBACK = 'https://sarah-jabalha.netlify.app'

export const settings: Settings = {
  siteUrl: import.meta.env?.VITE_PUBLIC_SITE_URL || SITE_URL_FALLBACK,
  name: 'Sarah Jaballah',
  email: 'sarahjaballh@gmail.com',
  phone: '+216 23 340 362',
  whatsapp: 'https://wa.me/21623340362',
  instagram: 'https://www.instagram.com/sarah.jaballh/',
  qrUrl: '',
  qrLabel: m('Scan to Explore My Portfolio', 'Scannez pour découvrir mon portfolio', 'امسح الرمز لاكتشاف أعمالي', 'Escanea para descubrir mi portafolio'),
}

export const sections: Sections = {
  hero: {
    kicker: m(
      'Cabin Crew · Customer Service · Guest Experience · Dance & Fitness',
      'Personnel navigant · Service client · Expérience client · Danse & fitness',
      'طاقم الضيافة الجوية · خدمة العملاء · تجربة الضيوف · الرقص واللياقة',
      'Tripulante de cabina · Atención al cliente · Experiencia del huésped · Danza y fitness',
    ),
    headline: m(
      'Creating Memorable Experiences Through Professionalism, Passion & Energy.',
      'Créer des expériences mémorables avec professionnalisme, passion et énergie.',
      'أصنع تجارب لا تُنسى بالاحترافية والشغف والطاقة.',
      'Creo experiencias memorables con profesionalidad, pasión y energía.',
    ),
    intro: m(
      'Six years of welcoming people — from luxury hotel stages in Turkey to front desks and dance studios in Tunisia. Calm, punctual and multilingual, I am ready to take guest care to the skies.',
      'Six ans à accueillir les gens, des scènes d’hôtels de luxe en Turquie aux accueils et studios de danse en Tunisie. Calme, ponctuelle et multilingue, je suis prête à porter le service client jusque dans les airs.',
      'ست سنوات في استقبال الناس، من مسارح الفنادق الفاخرة في تركيا إلى مكاتب الاستقبال واستوديوهات الرقص في تونس. هادئة ومنضبطة في المواعيد ومتعددة اللغات، وجاهزة لأحمل رعاية الضيوف إلى السماء.',
      'Seis años recibiendo a personas: de los escenarios de hoteles de lujo en Turquía a recepciones y estudios de danza en Túnez. Serena, puntual y multilingüe, lista para llevar la atención al huésped a las alturas.',
    ),
  },
  about: {
    title: m('Poise on stage. Care at every touchpoint.', 'De l’aisance sur scène. De l’attention à chaque instant.', 'حضور على المسرح، وعناية في كل لحظة.', 'Aplomo en el escenario. Cuidado en cada detalle.'),
    body: m(
      '6+ years of public-facing experience in international hospitality, front-desk administration and fitness instruction. Performing for international guests in luxury hotels in Turkey built my presentation, punctuality, teamwork, multicultural communication and calm under pressure.',
      'Plus de 6 ans d’expérience au contact du public dans l’hôtellerie internationale, l’administration d’accueil et l’enseignement du fitness. Me produire devant une clientèle internationale dans des hôtels de luxe en Turquie a forgé ma présentation, ma ponctualité, mon esprit d’équipe, ma communication interculturelle et mon calme sous pression.',
      'أكثر من 6 سنوات من الخبرة في التعامل مع الجمهور في مجال الضيافة الدولية والإدارة والاستقبال وتدريب اللياقة البدنية. صقلت عروضي أمام ضيوف دوليين في فنادق فاخرة بتركيا حسن المظهر والالتزام بالمواعيد والعمل الجماعي والتواصل بين الثقافات والهدوء تحت الضغط.',
      'Más de 6 años de experiencia de cara al público en hostelería internacional, administración de recepción e instrucción de fitness. Actuar para huéspedes internacionales en hoteles de lujo en Turquía forjó mi presencia, puntualidad, trabajo en equipo, comunicación multicultural y calma bajo presión.',
    ),
    location: m('Tunisia', 'Tunisie', 'تونس', 'Túnez'),
    nationality: m('Tunisian', 'Tunisienne', 'تونسية', 'Tunecina'),
    relocation: m('Open to relocation', 'Mobilité internationale', 'مستعدة للانتقال', 'Disponible para reubicarme'),
    stats: [
      { value: 6, suffix: '+', label: m('Years customer-facing', 'Ans au contact du public', 'سنوات في خدمة العملاء', 'Años de cara al público') },
      { value: 4, suffix: '', label: m('Languages', 'Langues', 'لغات', 'Idiomas') },
      { value: 2, suffix: '', label: m('Countries', 'Pays', 'بلدان', 'Países') },
    ],
  },
  dance: {
    intro: m(
      'Real moments from my classes: Zumba, dance and fitness sessions where every age and level finds its rhythm.',
      'De vrais moments de mes cours : Zumba, danse et fitness, où chaque âge et chaque niveau trouve son rythme.',
      'لحظات حقيقية من حصصي: زومبا ورقص ولياقة، حيث يجد كل عمر وكل مستوى إيقاعه.',
      'Momentos reales de mis clases: Zumba, danza y fitness, donde cada edad y nivel encuentra su ritmo.',
    ),
  },
  contact: {
    intro: m(
      'Recruiting cabin crew or building a guest-experience team? Let’s talk.',
      'Vous recrutez du personnel navigant ou une équipe d’accueil ? Parlons-en.',
      'هل توظفون طاقم ضيافة أو تبنون فريقًا لتجربة الضيوف؟ لنتحدث.',
      '¿Buscas tripulantes de cabina o un equipo de atención al huésped? Hablemos.',
    ),
  },
}

export const experiences: Experience[] = [
  {
    id: 'ledex', period: '2024 – 2026', sort_order: 1, visible: true,
    role: m('Dance Performer & Guest Experience', 'Danseuse & expérience client', 'راقصة استعراضية وتجربة الضيوف', 'Bailarina y experiencia del huésped'),
    company: m('LEDEX Event Company', 'LEDEX Event Company', 'شركة LEDEX للفعاليات', 'LEDEX Event Company'),
    location: m('Turkey', 'Turquie', 'تركيا', 'Turquía'),
    bullets: {
      en: ['Performed shows in luxury hotels and events for international guests', 'Interacted with guests before and after shows', 'Worked within multinational teams on synchronized performances', 'Adapted quickly to new venues and last-minute changes', 'Upheld strict grooming, uniform and conduct standards'],
      fr: ['Spectacles dans des hôtels de luxe et des événements pour une clientèle internationale', 'Échanges avec les clients avant et après les spectacles', 'Travail en équipes multinationales sur des chorégraphies synchronisées', 'Adaptation rapide à de nouveaux lieux et aux changements de dernière minute', 'Respect rigoureux des standards de présentation, d’uniforme et de conduite'],
      ar: ['تقديم عروض في فنادق فاخرة وفعاليات لضيوف دوليين', 'التواصل مع الضيوف قبل العروض وبعدها', 'العمل ضمن فرق متعددة الجنسيات في عروض متناسقة', 'التكيّف السريع مع أماكن جديدة وتغييرات اللحظة الأخيرة', 'الالتزام الصارم بمعايير المظهر والزي والسلوك'],
      es: ['Espectáculos en hoteles de lujo y eventos para huéspedes internacionales', 'Interacción con los huéspedes antes y después de cada show', 'Trabajo en equipos multinacionales con coreografías sincronizadas', 'Adaptación rápida a nuevos espacios y cambios de última hora', 'Cumplimiento estricto de normas de imagen, uniforme y conducta'],
    },
  },
  {
    id: 'academy', period: '2020 – 2024', sort_order: 2, visible: true,
    role: m('Receptionist & Administrative Assistant', 'Réceptionniste & assistante administrative', 'موظفة استقبال ومساعدة إدارية', 'Recepcionista y asistente administrativa'),
    company: m('Academy of Arts & Sports', 'Académie des Arts & Sports', 'أكاديمية الفنون والرياضة', 'Academia de Artes y Deportes'),
    location: m('Tunisia', 'Tunisie', 'تونس', 'Túnez'),
    bullets: {
      en: ['Welcomed visitors and handled calls, emails and inquiries', 'Managed registrations, payment follow-ups and member records', 'Organised class schedules', 'Resolved complaints with courtesy', 'Coordinated parents, instructors and management', 'Supported events and guest reception'],
      fr: ['Accueil des visiteurs, gestion des appels, e-mails et demandes', 'Inscriptions, suivi des paiements et dossiers des adhérents', 'Organisation des plannings de cours', 'Traitement courtois des réclamations', 'Coordination entre parents, professeurs et direction', 'Soutien aux événements et à l’accueil des invités'],
      ar: ['استقبال الزوار والرد على المكالمات والبريد الإلكتروني والاستفسارات', 'إدارة التسجيلات ومتابعة المدفوعات وسجلات الأعضاء', 'تنظيم جداول الحصص', 'معالجة الشكاوى بلباقة', 'التنسيق بين الأولياء والمدربين والإدارة', 'دعم الفعاليات واستقبال الضيوف'],
      es: ['Recepción de visitantes, llamadas, correos y consultas', 'Inscripciones, seguimiento de pagos y registros de socios', 'Organización de horarios de clases', 'Resolución cortés de reclamaciones', 'Coordinación entre familias, profesores y dirección', 'Apoyo en eventos y recepción de invitados'],
    },
  },
  {
    id: 'instructor', period: '2019 – 2024', sort_order: 3, visible: true,
    role: m('Dance & Fitness Instructor', 'Professeure de danse & fitness', 'مدربة رقص ولياقة بدنية', 'Instructora de danza y fitness'),
    company: m('Various Schools & Studios', 'Écoles & studios divers', 'مدارس واستوديوهات مختلفة', 'Diversas escuelas y estudios'),
    location: m('Tunisia', 'Tunisie', 'تونس', 'Túnez'),
    bullets: {
      en: ['Led dance, Zumba and fitness classes', 'Supervised children, teens and adults', 'Kept every participant safe and well', 'Adapted sessions to all ages and abilities', 'Created inclusive, motivating sessions'],
      fr: ['Animation de cours de danse, de Zumba et de fitness', 'Encadrement d’enfants, d’adolescents et d’adultes', 'Sécurité et bien-être de chaque participant', 'Adaptation des séances à tous les âges et niveaux', 'Des séances inclusives et motivantes'],
      ar: ['تقديم حصص الرقص والزومبا واللياقة البدنية', 'الإشراف على الأطفال والمراهقين والبالغين', 'الحرص على سلامة كل مشارك وراحته', 'تكييف الحصص مع جميع الأعمار والقدرات', 'خلق أجواء محفّزة تشمل الجميع'],
      es: ['Clases de danza, Zumba y fitness', 'Supervisión de niños, adolescentes y adultos', 'Seguridad y bienestar de cada participante', 'Sesiones adaptadas a todas las edades y niveles', 'Clases inclusivas y motivadoras'],
    },
  },
]

export const education: Education[] = [
  {
    id: 'ipset', period: '2018 – 2021', kind: 'degree', sort_order: 1, visible: true,
    title: m('Higher Diploma, Customs & Technical Formalities', 'Diplôme supérieur, douane & formalités techniques', 'شهادة عليا في الديوانة والإجراءات الفنية', 'Diploma superior en aduanas y trámites técnicos'),
    institution: m('IPSET, Tunisia', 'IPSET, Tunisie', 'IPSET، تونس', 'IPSET, Túnez'),
  },
  {
    id: 'bac', period: '2017', kind: 'degree', sort_order: 2, visible: true,
    title: m('Baccalaureate, Economics & Management', 'Baccalauréat, économie & gestion', 'باكالوريا اقتصاد وتصرف', 'Bachillerato en Economía y Gestión'),
    institution: m('Rawed High School, Tunisia', 'Lycée Rawed, Tunisie', 'معهد رواد، تونس', 'Instituto Rawed, Túnez'),
  },
  {
    id: 'zin', period: '', kind: 'certification', sort_order: 3, visible: true,
    title: m('Zumba International Instructor Certification (ZIN)', 'Certification d’instructrice Zumba internationale (ZIN)', 'شهادة مدربة زومبا دولية (ZIN)', 'Certificación de Instructora Internacional de Zumba (ZIN)'),
    institution: m('Zumba Instructor Network', 'Zumba Instructor Network', 'شبكة مدربي زومبا (ZIN)', 'Zumba Instructor Network'),
  },
]

const sk = (id: string, category: Skill['category'], sort_order: number, name: ML): Skill => ({ id, category, sort_order, name, visible: true })
export const skills: Skill[] = [
  sk('guest-care', 'care', 1, m('Passenger & guest care', 'Accueil des passagers & clients', 'رعاية الركاب والضيوف', 'Atención a pasajeros y huéspedes')),
  sk('multicultural', 'care', 2, m('Multicultural communication', 'Communication interculturelle', 'التواصل بين الثقافات', 'Comunicación multicultural')),
  sk('calm', 'care', 3, m('Calm under pressure', 'Calme sous pression', 'الهدوء تحت الضغط', 'Calma bajo presión')),
  sk('conflict', 'care', 4, m('Conflict resolution', 'Gestion des conflits', 'حل النزاعات', 'Resolución de conflictos')),
  sk('courtesy', 'care', 5, m('Courtesy', 'Courtoisie', 'اللباقة', 'Cortesía')),
  sk('safety', 'care', 6, m('Safety awareness', 'Sens de la sécurité', 'الوعي بالسلامة', 'Conciencia de seguridad')),
  sk('supervision', 'care', 7, m('Group supervision', 'Encadrement de groupes', 'الإشراف على المجموعات', 'Supervisión de grupos')),
  sk('teamwork', 'operations', 8, m('Teamwork', 'Travail d’équipe', 'العمل الجماعي', 'Trabajo en equipo')),
  sk('punctuality', 'operations', 9, m('Punctuality', 'Ponctualité', 'الالتزام بالمواعيد', 'Puntualidad')),
  sk('time', 'operations', 10, m('Time management', 'Gestion du temps', 'إدارة الوقت', 'Gestión del tiempo')),
  sk('grooming', 'operations', 11, m('Grooming & presentation', 'Présentation & tenue', 'حسن المظهر والهندام', 'Imagen y presencia')),
  sk('front-desk', 'operations', 12, m('Front desk', 'Accueil & réception', 'مكتب الاستقبال', 'Recepción')),
  sk('data-entry', 'office', 13, m('Data entry', 'Saisie de données', 'إدخال البيانات', 'Introducción de datos')),
  sk('records', 'office', 14, m('Records management', 'Gestion des dossiers', 'إدارة السجلات', 'Gestión de registros')),
  sk('scheduling', 'office', 15, m('Scheduling', 'Planification', 'جدولة المواعيد', 'Planificación de horarios')),
  sk('word', 'office', 16, m('Word', 'Word', 'Word', 'Word')),
  sk('excel', 'office', 17, m('Excel', 'Excel', 'Excel', 'Excel')),
  sk('powerpoint', 'office', 18, m('PowerPoint', 'PowerPoint', 'PowerPoint', 'PowerPoint')),
  sk('outlook', 'office', 19, m('Outlook', 'Outlook', 'Outlook', 'Outlook')),
]

const lg = (id: string, sort_order: number, name: ML, level: ML): Language => ({ id, sort_order, name, level, visible: true })
export const languages: Language[] = [
  lg('ar', 1, m('Arabic', 'Arabe', 'العربية', 'Árabe'), m('Native', 'Langue maternelle', 'اللغة الأم', 'Nativo')),
  lg('fr', 2, m('French', 'Français', 'الفرنسية', 'Francés'), m('Fluent', 'Courant', 'بطلاقة', 'Fluido')),
  lg('en', 3, m('English', 'Anglais', 'الإنجليزية', 'Inglés'), m('Fluent', 'Courant', 'بطلاقة', 'Fluido')),
  lg('es', 4, m('Spanish', 'Espagnol', 'الإسبانية', 'Español'), m('Intermediate', 'Intermédiaire', 'متوسط', 'Intermedio')),
]

export const socials: SocialLink[] = [
  { id: 'instagram', platform: 'instagram', url: settings.instagram, label: m('Instagram', 'Instagram', 'إنستغرام', 'Instagram'), sort_order: 1, visible: true },
  { id: 'whatsapp', platform: 'whatsapp', url: settings.whatsapp, label: m('WhatsApp', 'WhatsApp', 'واتساب', 'WhatsApp'), sort_order: 2, visible: true },
  { id: 'email', platform: 'email', url: `mailto:${settings.email}`, label: m('Email', 'E-mail', 'البريد الإلكتروني', 'Correo'), sort_order: 3, visible: true },
]

const still = (id: string, category: Category, sort_order: number, title: ML, featured = false): PortfolioItem => ({
  id, kind: 'image', src: `/media/img/${id}.webp`, thumb: `/media/img/${id}-sm.webp`, poster: null, title,
  description: m('', '', '', ''), caption: title, category, sort_order, featured, visible: true, is_illustration: false,
})
const classDance = m('Group dance class', 'Cours de danse collectif', 'حصة رقص جماعية', 'Clase de danza en grupo')
const gymSession = m('Fitness session', 'Séance de fitness', 'حصة لياقة بدنية', 'Sesión de fitness')
const zumbaClass = m('Zumba class', 'Cours de Zumba', 'حصة زومبا', 'Clase de Zumba')
const video = (n: number, category: Category, sort_order: number, title: ML, description: ML): PortfolioItem => ({
  id: `video-${n}`, kind: 'video', src: `/media/video/sarah-${n}.mp4`, poster: `/media/video/sarah-${n}-poster.webp`, thumb: `/media/video/sarah-${n}-poster.webp`,
  title, description, caption: title, category, sort_order, featured: true, visible: true, is_illustration: false,
})
const illus = (id: string, category: Category, sort_order: number, title: ML): PortfolioItem => ({
  id, kind: 'image', src: `/media/img/${id}.webp`, thumb: `/media/img/${id}.webp`, poster: null, title,
  description: m('', '', '', ''), caption: title, category, sort_order, featured: false, visible: true, is_illustration: true,
})

export const portfolio: PortfolioItem[] = [
  video(1, 'dance', 1, m('Dance class — full group', 'Cours de danse — tout le groupe', 'حصة رقص — المجموعة كاملة', 'Clase de danza — todo el grupo'),
    m('A full group choreography, led from the front of the studio.', 'Une chorégraphie de groupe, menée depuis l’avant du studio.', 'رقصة جماعية كاملة تُقاد من مقدمة الاستوديو.', 'Una coreografía de grupo guiada desde el frente del estudio.')),
  video(2, 'fitness', 2, m('Cardio & fitness routine', 'Routine cardio & fitness', 'تمرين كارديو ولياقة', 'Rutina de cardio y fitness'),
    m('High-energy footwork in the training gym.', 'Un jeu de jambes plein d’énergie en salle d’entraînement.', 'حركات قدم مليئة بالطاقة في قاعة التدريب.', 'Juego de pies lleno de energía en el gimnasio.')),
  video(3, 'zumba', 3, m('Zumba — on the beat', 'Zumba — dans le rythme', 'زومبا — على الإيقاع', 'Zumba — al ritmo'),
    m('Fifteen seconds of a Zumba class in full swing.', 'Quinze secondes d’un cours de Zumba en pleine action.', 'خمس عشرة ثانية من حصة زومبا في أوجها.', 'Quince segundos de una clase de Zumba en pleno ritmo.')),
  still('dance-1', 'dance', 4, classDance),
  still('dance-2', 'dance', 5, classDance),
  still('dance-3', 'events', 6, m('Studio session in motion', 'Séance en studio en mouvement', 'حصة في الاستوديو', 'Sesión de estudio en movimiento')),
  still('dance-4', 'dance', 7, classDance),
  still('fitness-1', 'fitness', 8, gymSession),
  still('fitness-2', 'fitness', 9, gymSession),
  still('fitness-3', 'fitness', 10, gymSession),
  still('fitness-4', 'professional', 11, m('Focus & discipline', 'Concentration & discipline', 'تركيز وانضباط', 'Concentración y disciplina')),
  still('zumba-1', 'zumba', 12, zumbaClass),
  still('zumba-2', 'zumba', 13, zumbaClass),
  illus('illustration-zumba', 'zumba', 14, m('Zumba artwork', 'Illustration Zumba', 'رسم توضيحي للزومبا', 'Ilustración de Zumba')),
  illus('illustration-fitdance', 'fitness', 15, m('Fit Dance artwork', 'Illustration Fit Dance', 'رسم توضيحي للرقص الرياضي', 'Ilustración Fit Dance')),
  illus('illustration-dance-collage', 'dance', 16, m('Street-dance artwork', 'Illustration street dance', 'رسم توضيحي لرقص الشارع', 'Ilustración de street dance')),
]
