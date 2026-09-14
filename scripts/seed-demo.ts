/**
 * Seeds realistic demo data: 10 example customers, 6 fully built example
 * websites (matching the /examples portfolio), subscriptions, leads,
 * support tickets and analytics history.
 *
 * Every row this script creates has `is_demo = true` (and demo auth users
 * are tagged in user_metadata), so it can be identified and removed
 * cleanly with `npm run seed:remove` without touching real customer data.
 *
 * Usage: npm run seed:demo
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Add them to .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO_PASSWORD = 'CymruSitesDemo2026!';

interface DemoBusinessSpec {
  slug: string;
  ownerName: string;
  businessName: string;
  industry: string;
  city: string;
  postcode: string;
  templateSlug: string;
  tagline: string;
  description: string;
  services: { title: string; description: string; price_from?: string }[];
  areas: string[];
  faqs: { question: string; answer: string }[];
  testimonials: { quote: string; author: string; location: string; rating: number }[];
}

const LIVE_SITES: DemoBusinessSpec[] = [
  {
    slug: 'rhys-electrical',
    ownerName: 'Rhys Owen',
    businessName: 'Rhys Electrical',
    industry: 'electrical',
    city: 'Cardiff',
    postcode: 'CF10 3AT',
    templateSlug: 'y-cwm',
    tagline: 'NICEIC registered electrical contractor',
    description:
      'Rhys Electrical provides domestic and commercial electrical services across Cardiff and the Vale of Glamorgan, from full rewires to EV charger installation.',
    services: [
      { title: 'Domestic rewires', description: 'Full and partial rewires to current regulations.', price_from: '£450' },
      { title: 'EV charger installation', description: 'OZEV-approved home charge point installation.', price_from: '£799' },
      { title: 'EICR & landlord certificates', description: 'Electrical safety certificates for landlords and homeowners.', price_from: '£120' },
      { title: 'Consumer unit upgrades', description: 'Modern, safe consumer units fitted and certified.', price_from: '£350' },
    ],
    areas: ['Cardiff', 'Penarth', 'Barry', 'Llantwit Major', 'Cowbridge'],
    faqs: [
      { question: 'Are you NICEIC registered?', answer: 'Yes, we are a NICEIC Approved Contractor, which is checked and audited annually.' },
      { question: 'Do you offer emergency call-outs?', answer: 'Yes, for existing customers we offer same-day emergency call-outs where possible.' },
    ],
    testimonials: [
      { quote: 'Rewired our whole house in three days, left it spotless. Couldn’t fault it.', author: 'Elin H.', location: 'Cardiff', rating: 5 },
      { quote: 'Fitted our EV charger quickly and explained everything clearly.', author: 'Tom B.', location: 'Penarth', rating: 5 },
    ],
  },
  {
    slug: 'cwm-valley-plumbing',
    ownerName: 'Gareth Lewis',
    businessName: 'Cwm Valley Plumbing',
    industry: 'plumbing',
    city: 'Pontypridd',
    postcode: 'CF37 1AB',
    templateSlug: 'y-bont',
    tagline: '24 hour emergency plumbing & heating',
    description:
      'Cwm Valley Plumbing offers 24 hour emergency call-outs, boiler repairs and bathroom installations across the Rhondda Cynon Taf valleys.',
    services: [
      { title: 'Emergency call-outs', description: 'Burst pipes and leaks, available 24 hours a day.', price_from: '£80' },
      { title: 'Boiler repair & servicing', description: 'Gas Safe registered boiler repairs and annual servicing.', price_from: '£90' },
      { title: 'Bathroom installation', description: 'Full bathroom design and installation.', price_from: '£2,500' },
      { title: 'Central heating', description: 'New systems and power flushing.', price_from: '£1,800' },
    ],
    areas: ['Pontypridd', 'Tonypandy', 'Porth', 'Llantrisant', 'Church Village'],
    faqs: [
      { question: 'Are you Gas Safe registered?', answer: 'Yes, our Gas Safe registration number is displayed on every job sheet and invoice.' },
      { question: 'How quickly can you attend an emergency?', answer: 'Usually within the hour for burst pipes and no-heat emergencies in our core areas.' },
    ],
    testimonials: [
      { quote: 'Boiler went at 11pm on a Sunday, Gareth was here within the hour. Brilliant.', author: 'Siân M.', location: 'Pontypridd', rating: 5 },
      { quote: 'New bathroom looks fantastic and they kept to the price they quoted.', author: 'Dave P.', location: 'Tonypandy', rating: 5 },
    ],
  },
  {
    slug: 'taff-roofing',
    ownerName: 'Ceri Davies',
    businessName: 'Taff Roofing',
    industry: 'roofing',
    city: 'Merthyr Tydfil',
    postcode: 'CF47 8AA',
    templateSlug: 'y-glannau',
    tagline: 'Roofing specialists for the Heads of the Valleys',
    description:
      'Taff Roofing carries out re-roofs, repairs and guttering across Merthyr Tydfil and the Heads of the Valleys, with a 10 year guarantee on new roofs.',
    services: [
      { title: 'Full re-roofs', description: 'Complete re-roofing with a 10 year workmanship guarantee.', price_from: '£4,500' },
      { title: 'Roof repairs', description: 'Slipped tiles, leaks and storm damage repaired quickly.', price_from: '£150' },
      { title: 'Flat roofing', description: 'GRP fibreglass flat roofs for extensions and garages.', price_from: '£900' },
      { title: 'Guttering & fascias', description: 'Full replacement or repair of guttering and fascias.', price_from: '£400' },
    ],
    areas: ['Merthyr Tydfil', 'Aberdare', 'Rhymney', 'Tredegar', 'Dowlais'],
    faqs: [
      { question: 'Do you offer free roof inspections?', answer: 'Yes, we offer a free, no-obligation roof inspection and written quote.' },
      { question: 'What guarantee do you offer?', answer: 'All full re-roofs come with a 10 year workmanship guarantee, in addition to manufacturer warranties.' },
    ],
    testimonials: [
      { quote: 'Storm damage sorted within a week, brilliant communication throughout.', author: 'Huw J.', location: 'Aberdare', rating: 5 },
      { quote: 'Re-roofed our whole terrace, tidy workers and fair price.', author: 'Angharad T.', location: 'Merthyr Tydfil', rating: 5 },
    ],
  },
  {
    slug: 'dragon-landscapes',
    ownerName: 'Dylan Rees',
    businessName: 'Dragon Landscapes',
    industry: 'landscaping',
    city: 'Caerphilly',
    postcode: 'CF83 1AP',
    templateSlug: 'y-glannau',
    tagline: 'Garden design & landscaping across Caerphilly county',
    description:
      'Dragon Landscapes designs and builds gardens across Caerphilly county borough, from patios and decking to full garden transformations.',
    services: [
      { title: 'Garden design', description: 'Full garden design service from concept to planting plan.', price_from: '£350' },
      { title: 'Patios & decking', description: 'Natural stone patios and timber or composite decking.', price_from: '£1,200' },
      { title: 'Lawn & turfing', description: 'New lawns laid and existing lawns renovated.', price_from: '£600' },
      { title: 'Garden maintenance', description: 'Regular maintenance visits to keep your garden looking its best.', price_from: '£45' },
    ],
    areas: ['Caerphilly', 'Ystrad Mynach', 'Bargoed', 'Risca', 'Blackwood'],
    faqs: [
      { question: 'Do you offer bilingual service?', answer: 'Yes — we’re happy to discuss your project in Welsh or English.' },
      { question: 'Do you do ongoing maintenance as well as one-off projects?', answer: 'Yes, many of our design clients move onto a regular maintenance visit afterwards.' },
    ],
    testimonials: [
      { quote: 'Transformed a muddy patch into a garden we actually use. Superb work.', author: 'Nia W.', location: 'Caerphilly', rating: 5 },
      { quote: 'Really listened to what we wanted and delivered exactly that.', author: 'Rob K.', location: 'Ystrad Mynach', rating: 5 },
    ],
  },
  {
    slug: 'valleys-auto-care',
    ownerName: 'Hayley Pritchard',
    businessName: 'Valleys Auto Care',
    industry: 'automotive',
    city: 'Aberdare',
    postcode: 'CF44 7AB',
    templateSlug: 'y-bont',
    tagline: 'Independent garage & MOT centre',
    description:
      'Valleys Auto Care is an independent garage and MOT test centre in Aberdare, offering honest servicing, repairs and MOTs at fair prices.',
    services: [
      { title: 'MOT testing', description: 'Class 4 MOT testing, booked online or by phone.', price_from: '£35' },
      { title: 'Full & interim servicing', description: 'Manufacturer-schedule servicing for all makes.', price_from: '£99' },
      { title: 'Diagnostics & repairs', description: 'Fault finding and repair using up-to-date diagnostic equipment.', price_from: '£45' },
      { title: 'Tyres & brakes', description: 'Supplied and fitted while you wait.', price_from: '£60' },
    ],
    areas: ['Aberdare', 'Mountain Ash', 'Hirwaun', 'Cwmaman'],
    faqs: [
      { question: 'Can I book an MOT online?', answer: 'Yes, use the booking form on this website and we’ll confirm a slot within one working day.' },
      { question: 'Do you offer a courtesy car?', answer: 'A courtesy car is available on request for servicing work, subject to availability.' },
    ],
    testimonials: [
      { quote: 'Honest garage, don’t try to sell you things you don’t need. Rare these days.', author: 'Mark D.', location: 'Aberdare', rating: 5 },
      { quote: 'Booked MOT online, in and out within the hour.', author: 'Lisa G.', location: 'Mountain Ash', rating: 5 },
    ],
  },
  {
    slug: 'caffi-bryn',
    ownerName: 'Catrin Morgan',
    businessName: 'Caffi Bryn',
    industry: 'hospitality',
    city: 'Swansea',
    postcode: 'SA1 3AA',
    templateSlug: 'y-castell',
    tagline: 'Independent café & bakery in the heart of Swansea',
    description:
      'Caffi Bryn is an independent café and bakery serving breakfast, lunch and fresh bakes daily, with a focus on local and Welsh produce.',
    services: [
      { title: 'Breakfast & brunch', description: 'Served daily from 8am, including Welsh rarebit and laverbread.', price_from: '£6' },
      { title: 'Fresh bakes', description: 'Bara brith, Welsh cakes and sourdough baked on site every morning.', price_from: '£3' },
      { title: 'Private bookings', description: 'The café is available for private bookings out of hours.' },
    ],
    areas: ['Swansea'],
    faqs: [
      { question: 'Do you take table bookings?', answer: 'Yes, for parties of six or more please book using the form on this website.' },
      { question: 'Is the menu available in Welsh?', answer: 'Yes, our full menu is available in Welsh and English.' },
    ],
    testimonials: [
      { quote: 'Best Welsh cakes in Swansea, and the coffee is excellent too.', author: 'Bethan L.', location: 'Swansea', rating: 5 },
      { quote: 'Lovely spot for breakfast, always busy but worth the wait.', author: 'James F.', location: 'Swansea', rating: 4 },
    ],
  },
];

const PIPELINE_CUSTOMERS: {
  ownerName: string;
  businessName: string;
  industry: string;
  city: string;
  postcode: string;
  status: string;
}[] = [
  { ownerName: 'Owain Pugh', businessName: 'Pugh Building Services', industry: 'building', city: 'Newport', postcode: 'NP20 1AA', status: 'lead' },
  { ownerName: 'Ffion Jenkins', businessName: 'Jenkins & Co Accountants', industry: 'professional_services', city: 'Bridgend', postcode: 'CF31 1AA', status: 'purchased' },
  { ownerName: 'Aled Thomas', businessName: 'Thomas Property Maintenance', industry: 'building', city: 'Swansea', postcode: 'SA1 4AA', status: 'in_production' },
  { ownerName: 'Megan Hughes', businessName: 'Hughes Hair & Beauty', industry: 'other', city: 'Cardiff', postcode: 'CF5 1AA', status: 'awaiting_customer_approval' },
];

async function findOrCreateAuthUser(email: string, fullName: string): Promise<string> {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) return found.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, is_demo: true },
  });
  if (error || !data.user) throw new Error(`Could not create demo auth user ${email}: ${error?.message}`);
  return data.user.id;
}

function randomPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

async function seedAnalytics(websiteId: string) {
  const rows = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const base = 25 + Math.round(Math.sin(i / 4) * 10) + Math.round(Math.random() * 15);
    const pageviews = Math.max(4, base);
    const sessions = Math.max(2, Math.round(pageviews * 0.62));
    const enquiries = Math.random() > 0.75 ? 1 + Math.floor(Math.random() * 2) : 0;
    rows.push({
      website_id: websiteId,
      date: date.toISOString().slice(0, 10),
      pageviews,
      sessions,
      enquiries,
      top_pages: [
        { path: '/', views: Math.round(pageviews * 0.45) },
        { path: '/services', views: Math.round(pageviews * 0.25) },
        { path: '/contact', views: Math.round(pageviews * 0.15) },
      ],
      sources: [
        { source: 'search', visits: Math.round(sessions * 0.5) },
        { source: 'direct', visits: Math.round(sessions * 0.35) },
        { source: 'social', visits: Math.round(sessions * 0.15) },
      ],
      is_demo: true,
    });
  }
  const { error } = await supabase.from('analytics_daily').upsert(rows, { onConflict: 'website_id,date' });
  if (error) console.error('  Analytics seed error:', error.message);
}

async function main() {
  console.log('Seeding demo data for CymruSites…\n');

  const { data: plans } = await supabase.from('plans').select('*');
  const { data: templates } = await supabase.from('website_templates').select('*');
  if (!plans?.length || !templates?.length) {
    console.error('No plans or templates found — run the database migrations first.');
    process.exit(1);
  }

  let liveCount = 0;
  let leadCount = 0;

  for (const spec of LIVE_SITES) {
    console.log(`Creating ${spec.businessName}…`);
    const email = `${spec.slug.replace(/-/g, '.')}@demo.cymrusites.co.uk`;
    const userId = await findOrCreateAuthUser(email, spec.ownerName);
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const template = templates.find((t) => t.slug === spec.templateSlug) ?? templates[0];

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          profile_id: userId,
          business_name: spec.businessName,
          contact_name: spec.ownerName,
          email,
          phone: '029 2000 0000',
          city: spec.city,
          postcode: spec.postcode,
          plan_id: plan.id,
          status: 'active',
          is_demo: true,
        },
        { onConflict: 'profile_id' },
      )
      .select('*')
      .single();
    if (customerError || !customer) {
      console.error(`  Failed to create customer: ${customerError?.message}`);
      continue;
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .upsert(
        {
          customer_id: customer.id,
          name: spec.businessName,
          industry: spec.industry,
          tagline: spec.tagline,
          description: spec.description,
          phone: '029 2000 0000',
          email,
          whatsapp_number: '07700900000',
          city: spec.city,
          postcode: spec.postcode,
          services: spec.services,
          service_areas: spec.areas,
          opening_hours: [
            { day: 'Monday', opens: '08:00', closes: '17:00', closed: false },
            { day: 'Tuesday', opens: '08:00', closes: '17:00', closed: false },
            { day: 'Wednesday', opens: '08:00', closes: '17:00', closed: false },
            { day: 'Thursday', opens: '08:00', closes: '17:00', closed: false },
            { day: 'Friday', opens: '08:00', closes: '17:00', closed: false },
            { day: 'Saturday', opens: '09:00', closes: '13:00', closed: spec.industry === 'professional_services' },
            { day: 'Sunday', opens: null, closes: null, closed: true },
          ],
          is_demo: true,
        },
        { onConflict: 'customer_id' },
      )
      .select('*')
      .single();
    if (businessError || !business) {
      console.error(`  Failed to create business: ${businessError?.message}`);
      continue;
    }

    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .upsert(
        {
          customer_id: customer.id,
          business_id: business.id,
          template_id: template.id,
          plan_id: plan.id,
          name: spec.businessName,
          slug: spec.slug,
          subdomain: spec.slug,
          status: 'live',
          published_at: randomPastDate(45),
          seo: { title: `${spec.businessName} | ${spec.city}`, description: spec.description.slice(0, 155) },
          is_demo: true,
        },
        { onConflict: 'slug' },
      )
      .select('*')
      .single();
    if (websiteError || !website) {
      console.error(`  Failed to create website: ${websiteError?.message}`);
      continue;
    }

    const pageDefs = [
      { slug: '', title: 'Home', nav_label: 'Home', page_type: 'home', is_home: true, sort_order: 0 },
      { slug: 'services', title: 'Services', nav_label: 'Services', page_type: 'services', sort_order: 1 },
      { slug: 'about', title: 'About', nav_label: 'About', page_type: 'about', sort_order: 2 },
      { slug: 'areas', title: 'Areas we cover', nav_label: 'Areas', page_type: 'areas', sort_order: 3 },
      { slug: 'contact', title: 'Contact', nav_label: 'Contact', page_type: 'contact', sort_order: 4 },
    ];
    const { data: pages, error: pagesError } = await supabase
      .from('website_pages')
      .upsert(
        pageDefs.map((p) => ({ ...p, website_id: website.id, is_published: true, show_in_nav: true })),
        { onConflict: 'website_id,slug' },
      )
      .select('*');
    if (pagesError || !pages) {
      console.error(`  Failed to create pages: ${pagesError?.message}`);
      continue;
    }
    const homePage = pages.find((p) => p.is_home);

    const sections = [
      { section_key: 'hero', section_type: 'hero', data: { heading: spec.businessName, subheading: spec.tagline, primaryCtaLabel: 'Call now', secondaryCtaLabel: 'Our services' } },
      { section_key: 'trust', section_type: 'trust', data: { items: spec.areas } },
      { section_key: 'services', section_type: 'services', data: { items: spec.services } },
      { section_key: 'about', section_type: 'about', data: { body: spec.description, team: [] } },
      { section_key: 'areas', section_type: 'areas', data: { items: spec.areas } },
      { section_key: 'testimonials', section_type: 'testimonials', data: { items: spec.testimonials } },
      { section_key: 'faq', section_type: 'faq', data: { items: spec.faqs } },
      { section_key: 'cta', section_type: 'cta', data: { heading: `Ready to talk to ${spec.businessName}?`, body: 'Get in touch and we’ll get back to you quickly.' } },
      { section_key: 'contact', section_type: 'contact', data: {} },
    ].map((s, i) => ({ ...s, website_id: website.id, page_id: homePage?.id ?? null, locale: 'en', sort_order: i, is_visible: true }));

    const { error: contentError } = await supabase
      .from('website_content')
      .upsert(sections, { onConflict: 'website_id,page_id,section_key,locale' });
    if (contentError) console.error(`  Failed to create content: ${contentError.message}`);

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('is_demo', true)
      .maybeSingle();
    if (!existingSub) {
      await supabase.from('subscriptions').insert({
        customer_id: customer.id,
        plan_id: plan.id,
        status: 'active',
        current_period_start: randomPastDate(15),
        current_period_end: randomPastDate(-15),
        amount_pence: plan.monthly_price_pence,
        is_demo: true,
      });
    }

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('website_id', website.id)
      .maybeSingle();
    if (!existingOrder) {
      await supabase.from('orders').insert({
        customer_id: customer.id,
        plan_id: plan.id,
        website_id: website.id,
        kind: 'setup',
        status: 'paid',
        amount_pence: plan.setup_price_pence,
        paid_at: randomPastDate(45),
        is_demo: true,
      });

      await supabase.from('payments').insert([
        { customer_id: customer.id, description: `${plan.name} setup fee`, amount_pence: plan.setup_price_pence, status: 'succeeded', paid_at: randomPastDate(45), is_demo: true },
        { customer_id: customer.id, description: 'Monthly subscription', amount_pence: plan.monthly_price_pence, status: 'succeeded', paid_at: randomPastDate(15), is_demo: true },
      ]);
    }

    const { data: existingLeads } = await supabase.from('leads').select('id').eq('website_id', website.id).limit(1);
    const leadTemplates = existingLeads && existingLeads.length > 0 ? [] : [
      { name: 'Owen Francis', message: `Hi, could you give me a quote for work at my property? Looking to get this sorted in the next couple of weeks.` },
      { name: 'Kayleigh Price', message: `Do you have any availability this week? Would appreciate a call back when convenient.` },
      { name: 'Steffan Bevan', message: `Found you through a friend's recommendation — could you let me know your rates?` },
    ];
    if (leadTemplates.length > 0) {
      await supabase.from('leads').insert(
        leadTemplates.map((lead, i) => ({
          customer_id: customer.id,
          website_id: website.id,
          name: lead.name,
          email: `${lead.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: '07700 900100',
          message: lead.message,
          source: 'website_contact_form',
          status: i === 0 ? 'new' : i === 1 ? 'contacted' : 'won',
          created_at: randomPastDate(i * 5 + 2),
          is_demo: true,
        })),
      );
    }

    await seedAnalytics(website.id);
    liveCount += 1;
    console.log(`  ✓ ${spec.businessName} is live at /demo/${spec.slug}`);
  }

  console.log('\nCreating customers at earlier pipeline stages…');
  for (const spec of PIPELINE_CUSTOMERS) {
    const email = `${spec.businessName.toLowerCase().replace(/[^a-z]+/g, '.')}@demo.cymrusites.co.uk`;
    const userId = await findOrCreateAuthUser(email, spec.ownerName);
    const plan = plans[Math.floor(Math.random() * plans.length)];

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          profile_id: userId,
          business_name: spec.businessName,
          contact_name: spec.ownerName,
          email,
          city: spec.city,
          postcode: spec.postcode,
          plan_id: plan.id,
          status: 'active',
          is_demo: true,
        },
        { onConflict: 'profile_id' },
      )
      .select('*')
      .single();
    if (customerError || !customer) continue;

    await supabase.from('websites').upsert(
      {
        customer_id: customer.id,
        plan_id: plan.id,
        name: spec.businessName,
        slug: `${spec.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        status: spec.status,
        is_demo: true,
      },
      { onConflict: 'slug' },
    );

    if (spec.status !== 'lead') {
      await supabase.from('orders').insert({
        customer_id: customer.id,
        plan_id: plan.id,
        kind: 'setup',
        status: 'paid',
        amount_pence: plan.setup_price_pence,
        paid_at: randomPastDate(10),
        is_demo: true,
      });
    }

    leadCount += 1;
    console.log(`  ✓ ${spec.businessName} (${spec.status})`);
  }

  console.log('\nCreating example support tickets…');
  const { data: liveCustomers } = await supabase.from('customers').select('*').eq('is_demo', true).limit(3);
  if (liveCustomers) {
    for (const customer of liveCustomers) {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .insert({
          customer_id: customer.id,
          subject: 'Please update our opening hours',
          category: 'website_changes',
          status: 'resolved',
          created_by: customer.profile_id,
          is_demo: true,
        })
        .select('*')
        .single();

      if (ticket) {
        await supabase.from('support_messages').insert([
          { ticket_id: ticket.id, author_id: customer.profile_id, author_role: 'customer', author_name: customer.contact_name, body: 'Could you change our Saturday hours to 9am-1pm please?' },
          { ticket_id: ticket.id, author_role: 'admin', author_name: 'CymruSites support', body: 'All done — this is now live on your website. Let us know if you need anything else changed.' },
        ]);
      }
    }
  }

  console.log(`\nDone. ${liveCount} live example websites, ${leadCount} customers in the production pipeline.`);
  console.log(`Demo accounts use the password: ${DEMO_PASSWORD}`);
  console.log('Run `npm run seed:remove` at any time to remove every row this script created.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
