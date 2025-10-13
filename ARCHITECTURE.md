# apollyo Architecture

This document provides a comprehensive overview of the apollyo system architecture, design patterns, and implementation details.

## Table of Contents

- [System Overview](#system-overview)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Mode Architecture](#mode-architecture)
- [Agent System](#agent-system)
- [Filter System](#filter-system)
- [Session Management](#session-management)
- [API Design](#api-design)
- [Performance Optimization](#performance-optimization)

## System Overview

apollyo is a Next.js-based web application that discovers rare and valuable English words using two distinct operation modes:

- **Speed Mode**: Internal generation using phonetic patterns
- **Hyper Mode**: Web scraping with advanced filtering

### Technology Stack

\`\`\`
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript 5
├── Tailwind CSS v4
└── Radix UI

Backend:
├── Next.js API Routes
├── Server Actions
└── Edge Runtime (where applicable)

State Management:
├── React Hooks (useState, useEffect)
├── Local Storage (session persistence)
└── URL State (filter parameters)
\`\`\`

## Core Components

### 1. Internal Intelligence Agent

**Location**: `lib/agent/internal-intelligence.ts`

**Purpose**: Validates English words without external dictionaries using linguistic analysis.

**Key Features**:
- Phonetic pattern recognition
- Syllable structure analysis
- Consonant cluster validation
- Vowel distribution checking
- Rarity scoring (0-1)
- Market potential assessment (0-1)

**Algorithm**:
\`\`\`typescript
validateWord(word: string): boolean {
  1. Check basic structure (length, characters)
  2. Analyze phonetic patterns
  3. Validate consonant clusters
  4. Check vowel distribution
  5. Calculate confidence score
  6. Return true if score >= threshold
}
\`\`\`

### 2. Enhanced Filter Analyzer Agent

**Location**: `lib/agent/enhanced-filter-analyzer.ts`

**Purpose**: Analyzes filter configurations and creates optimized processing strategies.

**Key Features**:
- Filter complexity analysis
- Strategy recommendation
- OpenAI integration (optional)
- Adaptive learning from results

**Process**:
\`\`\`
Input: FilterConfig + Mode
  ↓
Analyze Complexity
  ↓
Generate Strategy
  ↓
(Optional) Enhance with OpenAI
  ↓
Output: ProcessingPlan
\`\`\`

### 3. Speed Mode Engine

**Location**: `lib/core/speed-mode-engine.ts`

**Purpose**: Generates English words using natural phonetic patterns.

**Algorithm**:
\`\`\`typescript
generateWords(filters: FilterConfig): Word[] {
  1. Initialize phonetic patterns
  2. Generate word candidates
  3. Apply flexible filters
  4. Validate with Internal Intelligence
  5. Score and rank results
  6. Filter duplicates (session)
  7. Return top results
}
\`\`\`

**Phonetic Patterns**:
- Consonants: b, c, d, f, g, h, j, k, l, m, n, p, r, s, t, v, w, x, y, z
- Vowels: a, e, i, o, u
- Common patterns: CV, CVC, CVCV, CVCCV, etc.

### 4. Hyper Crawler

**Location**: `lib/core/hyper-crawler.ts`

**Purpose**: Crawls the web to discover real, available words.

**Features**:
- Multi-source crawling
- Configurable depth (1-5 levels)
- Adaptive strategies
- Session-aware (no duplicates)
- Domain category filtering

**Crawl Strategy**:
\`\`\`
Level 1: Primary sources (dictionaries, word lists)
Level 2: Domain registrars, marketplaces
Level 3: Social media, forums
Level 4: Blogs, articles
Level 5: Deep web, archives
\`\`\`

**Adaptive Strategies**:
1. **Source Rotation**: Rotate between different sources
2. **Pattern Variation**: Vary search patterns
3. **Depth Adjustment**: Adjust crawl depth dynamically
4. **Filter Relaxation**: Relax filters if no results
5. **Time-Based Variation**: Change approach based on time

### 5. Session Manager

**Location**: `lib/core/session-manager.ts`

**Purpose**: Prevents duplicate results within a user session.

**Features**:
- 24-hour session persistence
- Duplicate detection
- Strategy tracking
- Statistics collection

**Data Structure**:
\`\`\`typescript
{
  sessionId: string,
  seenWords: Set<string>,
  searchHistory: SearchRecord[],
  lastStrategy: number,
  createdAt: Date,
  expiresAt: Date
}
\`\`\`

## Data Flow

### Speed Mode Flow

\`\`\`
User Input (Filters)
  ↓
Enhanced Filter Analyzer
  ↓
Speed Mode Engine
  ↓
Generate Candidates
  ↓
Internal Intelligence (Validation)
  ↓
Session Manager (Deduplication)
  ↓
Filter Manager (Apply Filters)
  ↓
Results (Sorted & Ranked)
\`\`\`

### Hyper Mode Flow

\`\`\`
User Input (Filters + Categories)
  ↓
Enhanced Filter Analyzer
  ↓
Hyper Crawler
  ↓
Web Scraping (Multi-Source)
  ↓
Internal Intelligence (Validation)
  ↓
Session Manager (Deduplication)
  ↓
Filter Manager (Apply All Filters)
  ↓
Results (Sorted & Ranked)
\`\`\`

## Mode Architecture

### Speed Mode

**Characteristics**:
- Offline operation
- Fast generation (1000+ words/second)
- Flexible filters only
- Phonetic-based generation
- No external dependencies

**Use Cases**:
- Quick brainstorming
- Rapid prototyping
- Initial exploration
- Offline work

### Hyper Mode

**Characteristics**:
- Online operation (web scraping)
- Slower but higher quality
- All advanced filters
- Real word discovery
- Domain category filtering

**Use Cases**:
- Serious projects
- Domain hunting
- Brand development
- Market research

## Agent System

### Internal Intelligence Agent

**Learning Mechanism**:
\`\`\`typescript
learn(word: string, userFeedback: boolean) {
  1. Update pattern weights
  2. Adjust confidence thresholds
  3. Store in user preferences
  4. Improve future validations
}
\`\`\`

### Enhanced Filter Analyzer Agent

**With OpenAI Integration**:
\`\`\`typescript
async analyzeWithAI(filters: FilterConfig): Promise<Strategy> {
  1. Prepare prompt with filter details
  2. Call OpenAI API (gpt-4)
  3. Parse AI recommendations
  4. Merge with internal analysis
  5. Return enhanced strategy
}
\`\`\`

**Without OpenAI**:
- Uses rule-based analysis
- Pattern matching
- Historical data
- Heuristic optimization

## Filter System

### Filter Hierarchy

\`\`\`
Flexible Filters (Speed Mode)
├── Length (min/max)
├── Pattern (starts, ends, contains, excludes)
├── Vowel Ratio
└── Double Consonants

Advanced Filters (Hyper Mode)
├── All Flexible Filters
├── Rarity Threshold
├── Market Potential
├── Pronunciation Difficulty
├── Syllable Count
├── Memorability
├── Brandability
├── Linguistic Options
├── Quality Control
└── Phonetic Preferences
\`\`\`

### Filter Application

\`\`\`typescript
applyFilters(words: Word[], filters: FilterConfig): Word[] {
  1. Apply length filters
  2. Apply pattern filters
  3. Apply phonetic filters
  4. Apply quality filters
  5. Apply scoring filters
  6. Sort by relevance
  7. Return filtered results
}
\`\`\`

## Session Management

### Session Lifecycle

\`\`\`
Create Session
  ↓
Store in localStorage
  ↓
Track searches
  ↓
Prevent duplicates
  ↓
Expire after 24h
  ↓
Clean up
\`\`\`

### Duplicate Prevention

\`\`\`typescript
isDuplicate(word: string): boolean {
  return this.seenWords.has(word.toLowerCase());
}

addWord(word: string): void {
  this.seenWords.add(word.toLowerCase());
  this.save();
}
\`\`\`

## API Design

### POST /api/search

**Request**:
\`\`\`typescript
{
  mode: 'speed' | 'hyper',
  filters: FilterConfig,
  maxResults: number,
  crawlDepth?: number,
  openaiKey?: string
}
\`\`\`

**Response**:
\`\`\`typescript
{
  success: boolean,
  results: Word[],
  metadata: {
    totalFound: number,
    processingTime: number,
    strategy: string,
    mode: string
  }
}
\`\`\`

**Error Handling**:
- 400: Invalid input
- 408: Request timeout (2 minutes)
- 500: Internal server error

## Performance Optimization

### Caching Strategy

\`\`\`typescript
// Speed Mode: Cache generated patterns
const patternCache = new Map<string, string[]>();

// Hyper Mode: Cache crawl results (5 minutes)
const crawlCache = new Map<string, CrawlResult>();
\`\`\`

### Lazy Loading

- Components loaded on demand
- Results paginated (virtual scrolling)
- Images lazy loaded

### Code Splitting

\`\`\`typescript
// Dynamic imports for heavy components
const ApiSettings = dynamic(() => import('@/components/api-settings'));
const ResultsManager = dynamic(() => import('@/components/results-manager'));
\`\`\`

### Debouncing

\`\`\`typescript
// Filter changes debounced (300ms)
const debouncedFilter = useMemo(
  () => debounce(applyFilters, 300),
  []
);
\`\`\`

## Security Considerations

### Input Validation

- Sanitize all user inputs
- Validate filter ranges
- Limit request sizes
- Rate limiting (future)

### API Key Protection

- OpenAI keys stored in localStorage only
- Never sent to server logs
- Optional feature (user-provided)

### XSS Prevention

- React automatic escaping
- No dangerouslySetInnerHTML
- Content Security Policy headers

## Scalability

### Horizontal Scaling

- Stateless API routes
- Session data in client storage
- No server-side sessions
- Edge-ready architecture

### Database (Future)

\`\`\`
Potential additions:
├── User accounts
├── Saved searches
├── Word collections
├── Analytics data
└── Rate limiting
\`\`\`

## Monitoring

### Metrics to Track

- Search latency
- Success/error rates
- Filter usage patterns
- Mode preferences
- Session duration
- Result quality scores

### Logging

\`\`\`typescript
console.log('[apollyo]', {
  action: 'search',
  mode: 'hyper',
  duration: 1234,
  results: 42
});
\`\`\`

## Future Enhancements

1. **Machine Learning**
   - Train custom models on user preferences
   - Improve word quality predictions
   - Personalized recommendations

2. **Real-time Collaboration**
   - Share searches with team
   - Collaborative filtering
   - Live result updates

3. **Advanced Analytics**
   - Trend analysis
   - Market insights
   - Competitor tracking

4. **API Access**
   - Public API for developers
   - Webhooks for automation
   - Bulk operations

---

For questions about the architecture, please contact admin@apollyo.com
