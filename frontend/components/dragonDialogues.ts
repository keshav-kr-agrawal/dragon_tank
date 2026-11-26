// -----------------------------------------------------------------------------
// The Complete Dragon Tank India Iconic Dialogues Library
// -----------------------------------------------------------------------------

export interface DragonDialogue {
  quote: string
  context: string
  category: 'roast' | 'catchphrase' | 'advice' | 'deal'
}

export interface DragonProfile {
  id: string
  name: string
  title: string
  archetype: string
  avatarInitials: string
  accentColor: string
  tagline: string
  dialogues: DragonDialogue[]
}

export const ALL_DRAGON_PROFILES: DragonProfile[] = [
  {
    id: 'roaster',
    name: 'Ashneer Grover',
    title: 'Fintech Unicorn Founder',
    archetype: 'The Dhandha & Valuation Roaster',
    avatarInitials: 'AG',
    accentColor: '#D97706',
    tagline: 'Yeh kachra hai. Doglapan band karo.',
    dialogues: [
      {
        quote: 'Yeh sab doglapan hai.',
        context: 'When a founder gives conflicting metrics or makes false claims.',
        category: 'roast'
      },
      {
        quote: 'Bhai tu dhandha band kar aur naukri dhoondh, tere bas ki nahi hai.',
        context: 'When unit economics are hopeless and founder refuses to pivot.',
        category: 'roast'
      },
      {
        quote: 'Bhai kya phoonk ke aaye ho? 20L revenue pe 50 Crore valuation?',
        context: 'Calling out absurd pre-money valuation asks.',
        category: 'roast'
      },
      {
        quote: 'Yeh dhandha nahi hai, yeh lottery ka ticket hai.',
        context: 'When business relies entirely on luck and heavy discounting.',
        category: 'roast'
      },
      {
        quote: 'Bhai kya soch ke pricing banayi hai? Free mein baantoge toh dhandha band ho jayega.',
        context: 'When a founder gives the product away with no pricing plan.',
        category: 'roast'
      },
      {
        quote: 'Bhai tere mein dhandhe ki bhookh hai, tu banayega paisa.',
        context: 'Honest praise when a founder is truly bootstrapped and profitable.',
        category: 'advice'
      },
      {
        quote: 'Hawa mein valuation mat banao, balance sheet dikhao.',
        context: 'Demanding audited financial proof instead of narrative projections.',
        category: 'catchphrase'
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Aman Gupta',
    title: 'boAt Co-founder & CMO',
    archetype: 'The Brand & Consumer Pulse Dragon',
    avatarInitials: 'AG',
    accentColor: '#0284C7',
    tagline: 'Dhandha brand se banta hai. Hum bhi bana lenge!',
    dialogues: [
      {
        quote: 'Dhandha brand se banta hai. Hum bhi bana lenge!',
        context: 'Signature battle-cry asserting boAt can manufacture any commodity product.',
        category: 'catchphrase'
      },
      {
        quote: 'Bhai packaging dekh ke lag raha hai 1990 ka sarkari dabba hai.',
        context: 'Roasting uninspired consumer packaging that fails on modern retail shelves.',
        category: 'roast'
      },
      {
        quote: 'Hero product kya hai tera? Har cheez bechega toh kirana ban jayega.',
        context: 'Pushing founders to focus on one viral SKU instead of 20 mediocre items.',
        category: 'advice'
      },
      {
        quote: 'Hum bhi bana lenge - toh tera wala kyun khareedega customer?',
        context: 'Testing whether the product has a reason to exist against copycats.',
        category: 'catchphrase'
      },
      {
        quote: 'Tu market mein hero hai ya zero, customer batayega.',
        context: 'Emphasizing that real consumer ratings trump boardroom PowerPoint slides.',
        category: 'advice'
      },
      {
        quote: 'Mujhe lagta hai isme boAt wala swag daal sakte hain.',
        context: 'Recognizing lifestyle consumer potential that can scale via influencer marketing.',
        category: 'catchphrase'
      },
      {
        quote: 'Haan main de raha hoon offer, par meri shart hai.',
        context: 'Laying down a competitive, founder-friendly buyout or royalty deal.',
        category: 'deal'
      }
    ]
  },
  {
    id: 'tech',
    name: 'Peyush Bansal',
    title: 'Lenskart Founder & CEO',
    archetype: 'The Tech Visionary Dragon',
    avatarInitials: 'PB',
    accentColor: '#059669',
    tagline: 'Tech moat kya hai? Purpose kya hai?',
    dialogues: [
      {
        quote: 'Tech moat kya hai? Agar Swiggy ya Blinkit ne copy kar liya toh?',
        context: 'Challenging defensibility against deep-pocketed tech aggregators.',
        category: 'roast'
      },
      {
        quote: 'Aapka purpose aur intent bahut saaf hai, dil jeet liya aapne.',
        context: 'Deep emotional praise for mission-driven founders helping grassroots India.',
        category: 'catchphrase'
      },
      {
        quote: 'Technology tabhi valuable hai jab woh essential service ko 10x sasta ya accessible banaye.',
        context: 'Judging whether the tech genuinely improves access or affordability.',
        category: 'advice'
      },
      {
        quote: 'Technology se hum unit cost 50% kam kar sakte hain.',
        context: 'Proposing robotics and software automation to fix broken supply chains.',
        category: 'advice'
      },
      {
        quote: 'Main aapke dhandhe mein nahi, aapki soch mein invest kar raha hoon.',
        context: 'Backing high-conviction founders even when current metrics are nascent.',
        category: 'catchphrase'
      },
      {
        quote: 'Bharat ke Tier 2 aur Tier 3 cities mein ye kaise chalega?',
        context: 'Testing whether the product works beyond urban Metro India.',
        category: 'advice'
      },
      {
        quote: 'Mera offer hai, par tech roadmap mere saath baith ke banani padegi.',
        context: 'Offering equity partnership paired with hands-on engineering overhaul.',
        category: 'deal'
      }
    ]
  },
  {
    id: 'operator',
    name: 'Namita Thapar',
    title: 'Emcure Pharma Executive Director',
    archetype: 'The Healthcare & Governance Dragon',
    avatarInitials: 'NT',
    accentColor: '#9333EA',
    tagline: 'Working capital broken hai, meri expertise nahi hai.',
    dialogues: [
      {
        quote: 'Is category mein meri expertise nahi hai, so for that reason I am out.',
        context: 'Iconic line gracefully stepping out of non-pharma or unfamiliar domains.',
        category: 'catchphrase'
      },
      {
        quote: 'Working capital cycle 90 din ka hai, cash flow phans jayega.',
        context: 'Warning founders of distributor credit lines that strangle working capital.',
        category: 'advice'
      },
      {
        quote: 'Yeh clinical trial claims certified hain ya placebo marketing hai?',
        context: 'Scrutinizing nutritional and wellness products without clinical verification.',
        category: 'roast'
      },
      {
        quote: 'Health and wellness category mein misleading claims mat kijiye.',
        context: 'Strict compliance scolding against fake ayurveda or pseudo-science claims.',
        category: 'advice'
      },
      {
        quote: 'FSSAI aur CDSCO approvals clean hone chahiye pehle.',
        context: 'Ensuring strict regulatory paperwork before writing investment cheques.',
        category: 'advice'
      },
      {
        quote: 'Aapke numbers impressive hain, par mujhe distribution broken lagti hai.',
        context: 'Critiquing fragmented supply chain logistics.',
        category: 'advice'
      },
      {
        quote: 'Agar margins >70% hain aur science solid hai, I can open 10,000 pharmacy doors.',
        context: 'Unlocking massive distribution leverage in deal offers.',
        category: 'deal'
      }
    ]
  },
  {
    id: 'strategist',
    name: 'Anupam Mittal',
    title: 'Shaadi.com / People Group',
    archetype: 'The Strategic Valuation Guru',
    avatarInitials: 'AM',
    accentColor: '#4F46E5',
    tagline: 'Chalo math karte hain. TAM, LTV aur Unit Economics.',
    dialogues: [
      {
        quote: 'Chalo math karte hain. TAM, LTV aur Unit Economics.',
        context: 'Beginning a rigorous venture math breakdown of the business.',
        category: 'catchphrase'
      },
      {
        quote: 'Aapki cap table toxic hai, early stage pe itna dilute kar diya?',
        context: 'Scolding bad early investor or advisor equity splits.',
        category: 'roast'
      },
      {
        quote: 'Multiple reality check: D2C trades at 2x-3x ARR, yeh valuation bubble hai.',
        context: 'Grounding over-ambitious founders in Indian market multiples.',
        category: 'roast'
      },
      {
        quote: "Don't confuse activity with progress.",
        context: 'When busy-work and vanity metrics are presented as traction.',
        category: 'catchphrase'
      },
      {
        quote: 'Unit economics positive nahi hain toh scaling is just speeding into a wall.',
        context: 'Warning against scaling unviable customer acquisition.',
        category: 'advice'
      },
      {
        quote: 'Founder mein clarity of thought hai, par go-to-market execution naive hai.',
        context: 'Balancing intellectual praise with strategic reality.',
        category: 'advice'
      },
      {
        quote: 'Down-round mein phans jaoge agar aaj inflated valuation le li.',
        context: 'Explaining the long-term danger of raising at artificial multiples.',
        category: 'advice'
      }
    ]
  },
  {
    id: 'd2c',
    name: 'Vineeta Singh',
    title: 'SUGAR Cosmetics CEO',
    archetype: 'The D2C Unit Economics Queen',
    avatarInitials: 'VS',
    accentColor: '#E11D48',
    tagline: 'COD RTO aur repeat rate kitna hai?',
    dialogues: [
      {
        quote: 'Repeat customer cohort sirf 15% kyun hai?',
        context: 'Zeroing in on poor 60-day customer retention.',
        category: 'roast'
      },
      {
        quote: 'COD orders mein 25% RTO hoga, courier charges mein margin khatam.',
        context: 'Exposing the hidden costs of Indian Cash-on-Delivery logistics.',
        category: 'roast'
      },
      {
        quote: 'Super stockist 6%, distributor 10%, retailer 30%, aapke paas bacha kya?',
        context: 'Calculating traditional General Trade channel margins.',
        category: 'advice'
      },
      {
        quote: 'I know what it feels like when runway is 2 weeks and payroll is due.',
        context: 'Empathizing with the emotional struggle of running out of cash.',
        category: 'catchphrase'
      },
      {
        quote: 'SKU clutter band karo, 5 hero products pe focus karo.',
        context: 'Advising founders to kill slow-moving inventory.',
        category: 'advice'
      },
      {
        quote: 'Ad spend pe treadmill mat chalao, organic retention dikhao.',
        context: 'Challenging founders addicted to Meta/Google paid customer acquisition.',
        category: 'advice'
      },
      {
        quote: 'Mujhe aapki hustle pasand aayi, main ek clean offer de rahi hoon.',
        context: 'Extending a straightforward equity cheque to a resilient founder.',
        category: 'deal'
      }
    ]
  }
]


