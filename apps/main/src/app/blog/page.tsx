import { FooterPageLayout } from '@/components/footer-page-layout';
import { Calendar, Clock, ArrowRight, TrendingUp, Search } from 'lucide-react';
import Link from 'next/link';

const featuredPost = {
  title: 'How AI-Powered Journaling Can Transform Your Self-Reflection Practice',
  excerpt: 'Discover how artificial intelligence is revolutionizing the way we journal, offering personalized prompts and insights that deepen self-awareness and accelerate personal growth.',
  author: 'Sarah Chen',
  date: 'March 15, 2024',
  readTime: '8 min read',
  category: 'AI & Productivity',
  image: 'from-blue-500 to-purple-500',
  slug: 'ai-journaling-transformation',
};

const recentPosts = [
  {
    title: 'The Science Behind Habit Formation: Why Streaks Actually Work',
    excerpt: 'Explore the neuroscience and psychology behind why tracking streaks is one of the most effective methods for building lasting habits.',
    author: 'Dr. Michael Rodriguez',
    date: 'March 12, 2024',
    readTime: '6 min read',
    category: 'Habits & Behavior',
    image: 'from-green-500 to-emerald-500',
    slug: 'science-habit-formation',
  },
  {
    title: '5 Goal-Setting Frameworks That Actually Work in 2024',
    excerpt: 'Move beyond SMART goals with these modern frameworks designed for the complexity of today\'s world.',
    author: 'Emily Thompson',
    date: 'March 10, 2024',
    readTime: '7 min read',
    category: 'Goals & Growth',
    image: 'from-purple-500 to-pink-500',
    slug: 'goal-setting-frameworks-2024',
  },
  {
    title: 'Mood Tracking 101: Understanding Your Emotional Patterns',
    excerpt: 'Learn how consistent mood tracking can reveal hidden patterns and help you understand what truly impacts your well-being.',
    author: 'Dr. Amanda Liu',
    date: 'March 8, 2024',
    readTime: '5 min read',
    category: 'Mental Health',
    image: 'from-red-500 to-orange-500',
    slug: 'mood-tracking-guide',
  },
  {
    title: 'From Overwhelmed to Organized: A Task Management Revolution',
    excerpt: 'Discover the productivity system that helps high-performers manage hundreds of tasks without feeling buried.',
    author: 'James Parker',
    date: 'March 5, 2024',
    readTime: '9 min read',
    category: 'Productivity',
    image: 'from-orange-500 to-yellow-500',
    slug: 'task-management-revolution',
  },
  {
    title: 'The Power of Visual Memory: Why Photo Journaling Works',
    excerpt: 'Science shows that combining images with written reflection creates stronger memories and deeper insights.',
    author: 'Rachel Kim',
    date: 'March 3, 2024',
    readTime: '6 min read',
    category: 'Memory & Learning',
    image: 'from-pink-500 to-rose-500',
    slug: 'photo-journaling-power',
  },
  {
    title: 'Building a Morning Routine That Sticks: Lessons from 1,000 Users',
    excerpt: 'We analyzed data from thousands of users to discover what makes morning routines actually sustainable.',
    author: 'Alex Turner',
    date: 'March 1, 2024',
    readTime: '8 min read',
    category: 'Routines',
    image: 'from-cyan-500 to-blue-500',
    slug: 'morning-routine-insights',
  },
];

const categories = [
  { name: 'All Posts', count: 47 },
  { name: 'AI & Productivity', count: 12 },
  { name: 'Habits & Behavior', count: 15 },
  { name: 'Goals & Growth', count: 8 },
  { name: 'Mental Health', count: 9 },
  { name: 'Productivity', count: 18 },
  { name: 'Routines', count: 7 },
];

export default function BlogPage() {
  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            The AINexSuite Blog
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Insights on productivity, habits, personal growth, and the science behind behavior change.
            Learn how to make the most of your journey to becoming your best self.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 pl-12 pr-6 py-4 text-white placeholder:text-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                index === 0
                  ? 'bg-[#f97316] text-white hover:bg-[#ea6a0f]'
                  : 'border border-white/20 text-white/70 hover:border-[#f97316]/50 hover:text-white'
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-70">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 overflow-hidden shadow-lg">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Featured Image Placeholder */}
            <div className={`aspect-[16/10] lg:aspect-auto bg-gradient-to-br ${featuredPost.image} opacity-20`} />

            {/* Featured Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-full bg-[#f97316]/10 px-3 py-1 text-xs font-semibold text-[#f97316]">
                  Featured
                </span>
                <span className="text-xs text-white/50">{featuredPost.category}</span>
              </div>
              <h2 className="text-3xl font-semibold text-white mb-4 lg:text-4xl">
                {featuredPost.title}
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/60 mb-6">
                <span className="font-medium text-white">{featuredPost.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 text-[#f97316] font-semibold hover:gap-3 transition-all"
              >
                Read Full Article
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Recent Articles</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Fresh insights and actionable advice to help you grow, every week.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-3xl border border-white/10 bg-zinc-800/80 overflow-hidden shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
              >
                {/* Image Placeholder */}
                <div className={`aspect-[16/9] bg-gradient-to-br ${post.image} opacity-20 group-hover:opacity-30 transition`} />

                {/* Content */}
                <div className="p-6">
                  <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/60 mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#f97316] transition">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316] mx-auto">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Never Miss an Article
            </h2>
            <p className="text-white/70">
              Get our latest insights on productivity, habits, and personal growth delivered to your inbox every week.
              Join 10,000+ readers who are leveling up their lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-white/10 bg-zinc-800/80 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
              />
              <button className="rounded-xl bg-[#f97316] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ea6a0f] transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-white/50">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl mb-4">Explore by Topic</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Dive deep into specific areas of personal development and productivity.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/blog/category/ai-productivity"
              className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
            >
              <h3 className="text-lg font-semibold text-white mb-2">AI & Productivity</h3>
              <p className="text-sm text-white/60 mb-3">
                How artificial intelligence is changing the way we work and live.
              </p>
              <span className="text-sm text-[#f97316] font-semibold">12 articles →</span>
            </Link>
            <Link
              href="/blog/category/habits"
              className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Habits & Behavior</h3>
              <p className="text-sm text-white/60 mb-3">
                The science and practice of building lasting positive habits.
              </p>
              <span className="text-sm text-[#f97316] font-semibold">15 articles →</span>
            </Link>
            <Link
              href="/blog/category/goals"
              className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Goals & Growth</h3>
              <p className="text-sm text-white/60 mb-3">
                Strategies for setting and achieving meaningful life goals.
              </p>
              <span className="text-sm text-[#f97316] font-semibold">8 articles →</span>
            </Link>
            <Link
              href="/blog/category/mental-health"
              className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Mental Health</h3>
              <p className="text-sm text-white/60 mb-3">
                Understanding and improving your emotional well-being.
              </p>
              <span className="text-sm text-[#f97316] font-semibold">9 articles →</span>
            </Link>
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <button className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors">
            Load More Articles
          </button>
        </div>
      </div>
    </FooterPageLayout>
  );
}
