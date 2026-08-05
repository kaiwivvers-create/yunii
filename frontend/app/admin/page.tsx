'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '../../components/Navbar';
import { ChevronLeft } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'universities' | 'regions' | 'details'>('universities');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [regionSearchQuery, setRegionSearchQuery] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/explore');
      return;
    }
    setUser(parsedUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    // Use mock data matching university page data - will connect to database when backend is ready
    setUniversities([
      { 
        id: 1, 
        name: 'Harvard University', 
        location: 'Cambridge, USA', 
        province: 'Massachusetts', 
        region: 'North America', 
        description: 'Ivy League research university',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
        details: {
          overview: 'Founded in 1636, Harvard is the oldest institution of higher learning in the United States',
          details: ['Located in Cambridge, Massachusetts', 'Part of the prestigious Ivy League', 'Known for its law, business, and medical schools', 'Endowment of over $50 billion', 'Notable alumni include 8 U.S. Presidents and numerous Nobel laureates'],
          courses: [
            { name: 'Computer Science', details: 'Study of computation and information' },
            { name: 'Economics', details: 'Study of production, consumption, and transfer of wealth' },
            { name: 'Political Science', details: 'Study of politics and government' },
            { name: 'Psychology', details: 'Study of mind and behavior' }
          ],
          requirements: ['High school diploma or equivalent', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities'],
          prices: { undergraduate: '$57,261 per year', graduate: '$52,000 - $58,000 per year' }
        }
      },
      { 
        id: 2, 
        name: 'MIT', 
        location: 'Cambridge, USA', 
        province: 'Massachusetts', 
        region: 'North America', 
        description: 'Leading technology and engineering school',
        image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800',
        details: {
          overview: 'Founded in 1861, MIT is world-renowned for engineering, computer science, and physical sciences',
          details: ['Located in Cambridge, Massachusetts', 'Strong emphasis on innovation and entrepreneurship', 'Notable for developing key technologies like the internet and GPS', '96 Nobel laureates associated with the institute'],
          courses: [
            { name: 'Computer Science', details: 'Study of computation and information' },
            { name: 'Electrical Engineering', details: 'Study of electrical systems' },
            { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
            { name: 'Physics', details: 'Study of matter and energy' }
          ],
          requirements: ['High school diploma with strong STEM focus', 'SAT/ACT scores (high math and science)', 'Letters of recommendation from math/science teachers', 'Personal statement', 'Research experience or projects'],
          prices: { undergraduate: '$57,986 per year', graduate: '$57,590 per year' }
        }
      },
      { 
        id: 3, 
        name: 'Stanford University', 
        location: 'Stanford, USA', 
        province: 'California', 
        region: 'North America', 
        description: 'Silicon Valley research university',
        image: 'https://images.unsplash.com/photo-1571269259264-5ccb2e888cbe?w=800',
        details: {
          overview: 'Founded in 1885, Stanford is known for its academic strength and proximity to Silicon Valley',
          details: ['Located in Stanford, California', 'Strong ties to Silicon Valley tech industry', 'Known for entrepreneurship and innovation', 'One of the largest university campuses in the US'],
          courses: [
            { name: 'Computer Science', details: 'Study of computation and information' },
            { name: 'Business', details: 'Study of business administration' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Medicine', details: 'Study of medical sciences' }
          ],
          requirements: ['High school diploma', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities'],
          prices: { undergraduate: '$56,169 per year', graduate: '$54,315 per year' }
        }
      },
      { 
        id: 4, 
        name: 'University of Oxford', 
        location: 'Oxford, UK', 
        province: 'England', 
        region: 'Europe', 
        description: 'Oldest English-speaking university',
        image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
        details: {
          overview: 'Founded in 1096, Oxford is the oldest university in the English-speaking world',
          details: ['Located in Oxford, England', 'Collegiate system with 39 colleges', 'Known for academic excellence and research', 'Notable alumni include 28 British Prime Ministers'],
          courses: [
            { name: 'Philosophy, Politics and Economics', details: 'Interdisciplinary study of PPE' },
            { name: 'Medicine', details: 'Study of medical sciences' },
            { name: 'Law', details: 'Study of legal systems' },
            { name: 'English Literature', details: 'Study of English literature' }
          ],
          requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test', 'Interview'],
          prices: { undergraduate: '£9,250 per year (UK)', graduate: '£10,000 - £40,000 per year' }
        }
      },
      { 
        id: 5, 
        name: 'University of Cambridge', 
        location: 'Cambridge, UK', 
        province: 'England', 
        region: 'Europe', 
        description: 'Historic research university',
        image: 'https://images.unsplash.com/photo-1592500565497-991d3e2e5f9a?w=800',
        details: {
          overview: 'Founded in 1209, Cambridge is one of the world\'s oldest and most prestigious universities',
          details: ['Located in Cambridge, England', 'Collegiate system with 31 colleges', 'Known for scientific research and academic excellence', 'Notable alumni include 120 Nobel laureates'],
          courses: [
            { name: 'Natural Sciences', details: 'Study of natural sciences' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Mathematics', details: 'Study of mathematics' },
            { name: 'Computer Science', details: 'Study of computation and information' }
          ],
          requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test', 'Interview'],
          prices: { undergraduate: '£9,250 per year (UK)', graduate: '£10,000 - £45,000 per year' }
        }
      },
      { 
        id: 6, 
        name: 'ETH Zurich', 
        location: 'Zurich, Switzerland', 
        province: 'Zurich', 
        region: 'Europe', 
        description: 'Leading technical university',
        image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800',
        details: {
          overview: 'Founded in 1855, ETH Zurich is one of the world\'s leading technical universities',
          details: ['Located in Zurich, Switzerland', 'Known for engineering and technology', 'Strong industry connections', '21 Nobel laureates associated with the university'],
          courses: [
            { name: 'Computer Science', details: 'Study of computation and information' },
            { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
            { name: 'Electrical Engineering', details: 'Study of electrical systems' },
            { name: 'Architecture', details: 'Study of architecture and design' }
          ],
          requirements: ['High school diploma with strong math/science', 'Entrance exam', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'CHF 1,300 per semester', graduate: 'CHF 1,300 per semester' }
        }
      },
      { 
        id: 7, 
        name: 'Imperial College London', 
        location: 'London, UK', 
        province: 'England', 
        region: 'Europe', 
        description: 'Science-based institution',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
        details: {
          overview: 'Founded in 1907, Imperial College London is a science-based university in London',
          details: ['Located in London, England', 'Specialized in science, engineering, medicine, and business', 'Known for research excellence', 'Strong industry partnerships'],
          courses: [
            { name: 'Computing', details: 'Study of computer science' },
            { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
            { name: 'Medicine', details: 'Study of medical sciences' },
            { name: 'Business', details: 'Study of business administration' }
          ],
          requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test'],
          prices: { undergraduate: '£9,250 per year (UK)', graduate: '£15,000 - £35,000 per year' }
        }
      },
      { 
        id: 8, 
        name: 'National University of Singapore', 
        location: 'Singapore', 
        province: 'Singapore', 
        region: 'Asia', 
        description: 'Leading Asian university',
        image: 'https://images.unsplash.com/photo-1525635313341-29744db9f37d?w=800',
        details: {
          overview: 'Founded in 1905, NUS is Singapore\'s flagship university',
          details: ['Located in Singapore', 'Known for academic excellence in Asia', 'Strong research focus', 'International student body'],
          courses: [
            { name: 'Computer Science', details: 'Study of computation and information' },
            { name: 'Business', details: 'Study of business administration' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Medicine', details: 'Study of medical sciences' }
          ],
          requirements: ['High school diploma', 'SAT/ACT or equivalent', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'SGD 38,000 per year', graduate: 'SGD 40,000 - $50,000 per year' }
        }
      },
      { 
        id: 9, 
        name: 'Tsinghua University', 
        location: 'Beijing, China', 
        province: 'Beijing', 
        region: 'Asia', 
        description: 'Leading Chinese university',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
        details: {
          overview: 'Founded in 1911, Tsinghua is one of China\'s most prestigious universities',
          details: ['Located in Beijing, China', 'Known for engineering and computer science', 'Strong government connections', 'Alumni include many Chinese leaders'],
          courses: [
            { name: 'Computer Science', details: 'Study of computation and information' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Architecture', details: 'Study of architecture and design' },
            { name: 'Economics', details: 'Study of economics' }
          ],
          requirements: ['High school diploma', 'Gaokao exam', 'Personal statement', 'Interview'],
          prices: { undergraduate: 'CNY 5,000 per year', graduate: 'CNY 8,000 - $30,000 per year' }
        }
      },
      { 
        id: 10, 
        name: 'University of Tokyo', 
        location: 'Tokyo, Japan', 
        province: 'Tokyo', 
        region: 'Asia', 
        description: 'Japan\'s top university',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        details: {
          overview: 'Founded in 1877, the University of Tokyo is Japan\'s most prestigious university',
          details: ['Located in Tokyo, Japan', 'Known for research excellence', 'Strong in science and engineering', 'Many Nobel laureates among alumni'],
          courses: [
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Science', details: 'Study of natural sciences' },
            { name: 'Medicine', details: 'Study of medical sciences' },
            { name: 'Economics', details: 'Study of economics' }
          ],
          requirements: ['High school diploma', 'Entrance exam', 'Personal statement', 'Interview'],
          prices: { undergraduate: 'JPY 535,800 per year', graduate: 'JPY 535,800 per year' }
        }
      },
      { 
        id: 11, 
        name: 'Peking University', 
        location: 'Beijing, China', 
        province: 'Beijing', 
        region: 'Asia', 
        description: 'Historic Chinese university',
        image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
        details: {
          overview: 'Founded in 1898, Peking University is one of China\'s oldest and most prestigious universities',
          details: ['Located in Beijing, China', 'Known for humanities and social sciences', 'Beautiful campus with traditional Chinese architecture', 'Alumni include many Chinese leaders'],
          courses: [
            { name: 'Chinese Literature', details: 'Study of Chinese literature' },
            { name: 'History', details: 'Study of history' },
            { name: 'Philosophy', details: 'Study of philosophy' },
            { name: 'Economics', details: 'Study of economics' }
          ],
          requirements: ['High school diploma', 'Gaokao exam', 'Personal statement', 'Interview'],
          prices: { undergraduate: 'CNY 5,000 per year', graduate: 'CNY 8,000 - $30,000 per year' }
        }
      },
      { 
        id: 12, 
        name: 'Australian National University', 
        location: 'Canberra, Australia', 
        province: 'Australian Capital Territory', 
        region: 'Oceania', 
        description: 'National research university',
        image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800',
        details: {
          overview: 'Founded in 1946, ANU is Australia\'s national university',
          details: ['Located in Canberra, Australia', 'Known for research excellence', 'Strong in science and policy', 'Beautiful campus'],
          courses: [
            { name: 'Science', details: 'Study of natural sciences' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Law', details: 'Study of legal systems' },
            { name: 'Medicine', details: 'Study of medical sciences' }
          ],
          requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'AUD 34,000 per year', graduate: 'AUD 37,000 - $45,000 per year' }
        }
      },
      { 
        id: 13, 
        name: 'University of Melbourne', 
        location: 'Melbourne, Australia', 
        province: 'Victoria', 
        region: 'Oceania', 
        description: 'Australia\'s top university',
        image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
        details: {
          overview: 'Founded in 1853, the University of Melbourne is Australia\'s oldest university',
          details: ['Located in Melbourne, Australia', 'Known for academic excellence', 'Strong research focus', 'Beautiful campus'],
          courses: [
            { name: 'Arts', details: 'Study of humanities and arts' },
            { name: 'Science', details: 'Study of natural sciences' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Medicine', details: 'Study of medical sciences' }
          ],
          requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'AUD 30,000 - $45,000 per year', graduate: 'AUD 35,000 - $50,000 per year' }
        }
      },
      { 
        id: 14, 
        name: 'University of Sydney', 
        location: 'Sydney, Australia', 
        province: 'New South Wales', 
        region: 'Oceania', 
        description: 'Leading Australian university',
        image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800',
        details: {
          overview: 'Founded in 1850, the University of Sydney is Australia\'s first university',
          details: ['Located in Sydney, Australia', 'Historic campus', 'Known for academic excellence', 'Strong research programs'],
          courses: [
            { name: 'Arts', details: 'Study of humanities and arts' },
            { name: 'Science', details: 'Study of natural sciences' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Law', details: 'Study of legal systems' }
          ],
          requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'AUD 32,000 - $48,000 per year', graduate: 'AUD 38,000 - $55,000 per year' }
        }
      },
      { 
        id: 15, 
        name: 'University of São Paulo', 
        location: 'São Paulo, Brazil', 
        province: 'São Paulo', 
        region: 'South America', 
        description: 'Brazil\'s largest university',
        image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
        details: {
          overview: 'Founded in 1934, USP is Brazil\'s largest university',
          details: ['Located in São Paulo, Brazil', 'Public university with no tuition fees', 'Known for research excellence', 'Large student body'],
          courses: [
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Medicine', details: 'Study of medical sciences' },
            { name: 'Law', details: 'Study of legal systems' },
            { name: 'Economics', details: 'Study of economics' }
          ],
          requirements: ['High school diploma', 'ENEM exam', 'Personal statement', 'Interview'],
          prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' }
        }
      },
      { 
        id: 16, 
        name: 'University of Buenos Aires', 
        location: 'Buenos Aires, Argentina', 
        province: 'Buenos Aires', 
        region: 'South America', 
        description: 'Argentina\'s top university',
        image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800',
        details: {
          overview: 'Founded in 1821, UBA is Argentina\'s largest and most prestigious university',
          details: ['Located in Buenos Aires, Argentina', 'Public university with no tuition fees', 'Known for academic excellence', 'Many Nobel laureates among alumni'],
          courses: [
            { name: 'Medicine', details: 'Study of medical sciences' },
            { name: 'Law', details: 'Study of legal systems' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Economics', details: 'Study of economics' }
          ],
          requirements: ['High school diploma', 'Entrance exam', 'Personal statement'],
          prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' }
        }
      },
      { 
        id: 17, 
        name: 'University of Cape Town', 
        location: 'Cape Town, South Africa', 
        province: 'Western Cape', 
        region: 'Africa', 
        description: 'Africa\'s leading university',
        image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
        details: {
          overview: 'Founded in 1829, UCT is South Africa\'s oldest university',
          details: ['Located in Cape Town, South Africa', 'Beautiful campus with mountain views', 'Known for academic excellence', 'Strong research programs'],
          courses: [
            { name: 'Commerce', details: 'Study of business and commerce' },
            { name: 'Science', details: 'Study of natural sciences' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Humanities', details: 'Study of humanities' }
          ],
          requirements: ['High school diploma', 'NSC exam results', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'ZAR 50,000 - $80,000 per year', graduate: 'ZAR 60,000 - $100,000 per year' }
        }
      },
      { 
        id: 18, 
        name: 'Stellenbosch University', 
        location: 'Stellenbosch, South Africa', 
        province: 'Western Cape', 
        region: 'Africa', 
        description: 'Top South African university',
        image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
        details: {
          overview: 'Founded in 1918, Stellenbosch University is one of South Africa\'s top universities',
          details: ['Located in Stellenbosch, South Africa', 'Known for wine research', 'Beautiful campus in wine region', 'Strong academic programs'],
          courses: [
            { name: 'Agricultural Sciences', details: 'Study of agriculture' },
            { name: 'Science', details: 'Study of natural sciences' },
            { name: 'Engineering', details: 'Study of engineering disciplines' },
            { name: 'Business', details: 'Study of business administration' }
          ],
          requirements: ['High school diploma', 'NSC exam results', 'Personal statement', 'Letters of recommendation'],
          prices: { undergraduate: 'ZAR 45,000 - $75,000 per year', graduate: 'ZAR 55,000 - $95,000 per year' }
        }
      },
    ]);
    setRegions(['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa']);
  };

  const handleCreate = async () => {
    // For now, just add to local state - will connect to backend when ready
    if (activeTab === 'universities') {
      const newUni = {
        id: Date.now(),
        ...formData,
      };
      setUniversities([...universities, newUni]);
    } else {
      if (!regions.includes(formData.name)) {
        setRegions([...regions, formData.name]);
      }
    }
    setIsEditing(false);
    setFormData({});
  };

  const handleUpdate = async (id: number | string) => {
    // For now, just update local state - will connect to backend when ready
    if (activeTab === 'universities') {
      setUniversities(universities.map(u => u.id === id ? { ...u, ...formData } : u));
    }
    setIsEditing(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    // For now, just update local state - will connect to backend when ready
    if (activeTab === 'universities') {
      setUniversities(universities.filter(u => u.id !== id));
      // Adjust page if needed
      const totalPages = Math.ceil((universities.length - 1) / itemsPerPage);
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      setRegions(regions.filter(r => r !== id));
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsEditing(true);
  };

  const startCreate = () => {
    setEditingItem(null);
    setFormData(activeTab === 'universities' 
      ? { name: '', location: '', province: '', region: '', description: '', image: '' }
      : { name: '' }
    );
    setIsEditing(true);
  };

  const getFilteredUniversities = () => {
    return universities.filter(uni => {
      const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          uni.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterRegion === 'All' || uni.region === filterRegion;
      return matchesSearch && matchesFilter;
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Navigation */}
      <Navbar currentPage="admin" />

      {/* Main Content */}
      <section className="pt-24 pb-12 px-4 max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-2">Admin Dashboard</h1>
        <p className="text-slate-800 dark:text-dark-text-secondary mb-8">Manage universities and regions</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('universities')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'universities'
                ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-secondary'
            }`}
          >
            Universities
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'regions'
                ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-secondary'
            }`}
          >
            Regions
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-800 dark:text-dark-text hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-secondary'
            }`}
          >
            Details
          </button>
        </div>

        {/* Search and Filter */}
        {(activeTab === 'universities' || activeTab === 'details') && (
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder={activeTab === 'universities' ? "Search universities..." : "Search universities..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
            />
            {activeTab === 'universities' && (
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
              >
                <option value="All">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Search for Regions */}
        {activeTab === 'regions' && (
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search regions..."
              value={regionSearchQuery}
              onChange={(e) => setRegionSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
            />
          </div>
        )}

        {/* Create Button - only show for universities and regions */}
        {activeTab !== 'details' && (
          <div className="mb-6">
            <button
              onClick={startCreate}
              className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
            >
              + Add New {activeTab === 'universities' ? 'University' : 'Region'}
            </button>
          </div>
        )}

        {/* Edit/Create Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-4">
                {activeTab === 'details' ? `Edit Details: ${editingItem?.name}` : (editingItem ? 'Edit' : 'Add New') + ' ' + (activeTab === 'universities' ? 'University' : 'Region')}
              </h3>
              <div className="space-y-6">
                {activeTab === 'details' ? (
                  <>
                    {/* Overview Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Overview</h4>
                      <textarea
                        placeholder="University Overview"
                        value={formData.overview || ''}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                        rows={4}
                      />
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Details</h4>
                      <textarea
                        placeholder="University Details"
                        value={formData.details || ''}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                        rows={4}
                      />
                    </div>

                    {/* Courses Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Courses</h4>
                      <div className="space-y-2">
                        {formData.courses?.map((course: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Course name"
                              value={course.name || ''}
                              onChange={(e) => {
                                const newCourses = [...formData.courses];
                                newCourses[index] = { ...course, name: e.target.value };
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                            />
                            <input
                              type="text"
                              placeholder="Course details"
                              value={course.details || ''}
                              onChange={(e) => {
                                const newCourses = [...formData.courses];
                                newCourses[index] = { ...course, details: e.target.value };
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                            />
                            <button
                              onClick={() => {
                                const newCourses = formData.courses.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, courses: [...(formData.courses || []), { name: '', details: '' }] })}
                          className="px-4 py-2 bg-[#9370DB] text-white rounded hover:bg-[#7B68EE] transition-colors"
                        >
                          + Add Course
                        </button>
                      </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Requirements</h4>
                      <div className="space-y-2">
                        {formData.requirements?.map((req: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Requirement"
                              value={req}
                              onChange={(e) => {
                                const newReqs = [...formData.requirements];
                                newReqs[index] = e.target.value;
                                setFormData({ ...formData, requirements: newReqs });
                              }}
                              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                            />
                            <button
                              onClick={() => {
                                const newReqs = formData.requirements.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, requirements: newReqs });
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, requirements: [...(formData.requirements || []), ''] })}
                          className="px-4 py-2 bg-[#9370DB] text-white rounded hover:bg-[#7B68EE] transition-colors"
                        >
                          + Add Requirement
                        </button>
                      </div>
                    </div>

                    {/* Prices Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Prices</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Undergraduate</label>
                          <input
                            type="text"
                            placeholder="Undergraduate price"
                            value={formData.prices?.undergraduate || ''}
                            onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, undergraduate: e.target.value } })}
                            className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Graduate</label>
                          <input
                            type="text"
                            placeholder="Graduate price"
                            value={formData.prices?.graduate || ''}
                            onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, graduate: e.target.value } })}
                            className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : activeTab === 'universities' ? (
                  <>
                    <input
                      type="text"
                      placeholder="University Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    />
                    <input
                      type="text"
                      placeholder="Province"
                      value={formData.province || ''}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    />
                    <select
                      value={formData.region || ''}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    >
                      <option value="">Select Region</option>
                      {regions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                      rows={3}
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    />
                    {formData.image && (
                      <div className="w-full h-48 bg-white dark:bg-dark-bg-tertiary rounded-lg overflow-hidden">
                        <img 
                          src={formData.image} 
                          alt="University preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="Region Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (activeTab === 'details') {
                        // Update university details
                        setUniversities(universities.map(u => u.id === editingItem.id ? { ...u, details: formData } : u));
                      } else {
                        editingItem ? handleUpdate(editingItem.id || editingItem.name) : handleCreate();
                      }
                      setIsEditing(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                  >
                    {activeTab === 'details' ? 'Save Details' : (editingItem ? 'Update' : 'Create')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg overflow-hidden">
          {activeTab === 'universities' ? (
            <>
              <table className="w-full">
                <thead className="bg-[#A8A8C8] dark:bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Name</th>
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Location</th>
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Region</th>
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-dark-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUniversities()
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((uni) => (
                    <tr key={uni.id} className="border-t border-[#A8A8C8] dark:border-dark-border">
                      <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{uni.name}</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{uni.location}</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-dark-text">{uni.region}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => startEdit(uni)}
                          className="px-3 py-1 bg-[#60A5FA] text-white rounded hover:bg-[#3B82F6] transition-colors mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(uni.id)}
                          className="px-3 py-1 bg-[#8B5CF6] text-white rounded hover:bg-[#7C3AED] transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex justify-between items-center px-4 py-3 bg-[#A8A8C8] dark:bg-dark-bg-tertiary border-t border-[#A8A8C8] dark:border-dark-border">
                <span className="text-sm text-slate-800 dark:text-dark-text">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, getFilteredUniversities().length)} of {getFilteredUniversities().length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-[#60A5FA] text-white rounded hover:bg-[#3B82F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getFilteredUniversities().length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(getFilteredUniversities().length / itemsPerPage)}
                    className="px-3 py-1 bg-[#60A5FA] text-white rounded hover:bg-[#3B82F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'regions' ? (
            <div className="p-4 space-y-2">
              {regions.filter(r => r.toLowerCase().includes(regionSearchQuery.toLowerCase())).map((region) => (
                <div key={region} className="flex justify-between items-center p-3 bg-[#E8E8F0] dark:bg-dark-bg-tertiary rounded-lg">
                  <span className="text-slate-800 dark:text-dark-text">{region}</span>
                  <button
                    onClick={() => handleDelete(region)}
                    className="px-3 py-1 bg-[#8B5CF6] text-white rounded hover:bg-[#7C3AED] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[700px]">
              {/* Left side - University list (like explore regions sidebar) */}
              <div className="w-96 bg-[#C8C8E0] dark:bg-dark-bg-secondary p-4 h-full overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">Select University</h3>
                {getFilteredUniversities().map((uni) => (
                  <div
                    key={uni.id}
                    onClick={() => {
                      setSelectedUniversity(uni);
                      setEditingItem(uni);
                      setFormData(uni.details || {
                        overview: '',
                        details: '',
                        courses: [],
                        requirements: [],
                        prices: {
                          undergraduate: '',
                          graduate: ''
                        }
                      });
                    }}
                    className={`p-4 bg-[#E8E8F0] dark:bg-dark-bg-tertiary rounded-lg cursor-pointer transition-colors mb-2 ${
                      selectedUniversity?.id === uni.id ? 'border-2 border-[#9370DB] dark:border-dark-violet' : 'hover:bg-[#D8D8E8] dark:hover:bg-dark-bg-secondary'
                    }`}
                  >
                    <h4 className="font-semibold text-slate-900 dark:text-dark-text">{uni.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-dark-text-secondary">{uni.location}</p>
                  </div>
                ))}
              </div>

              {/* Right side - Details panel (like explore right side) */}
              <div className="flex-1 relative">
                {selectedUniversity ? (
                  <div className="w-full h-full bg-[#C8C8E0] dark:bg-dark-bg-secondary p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedUniversity(null)}
                      className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Image Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Image</h4>
                      <input
                        type="text"
                        placeholder="University Image URL"
                        value={formData.image || selectedUniversity?.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                      />
                      {(formData.image || selectedUniversity?.image) && (
                        <div className="w-full h-48 bg-white dark:bg-dark-bg-tertiary rounded-lg overflow-hidden">
                          <img 
                            src={formData.image || selectedUniversity?.image} 
                            alt="University preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Overview Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Overview</h4>
                      <textarea
                        placeholder="University Overview"
                        value={formData.overview || ''}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                        rows={4}
                      />
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Details</h4>
                      <textarea
                        placeholder="University Details"
                        value={formData.details || ''}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                        rows={4}
                      />
                    </div>

                    {/* Courses Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Courses</h4>
                      <div className="space-y-2">
                        {formData.courses?.map((course: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Course name"
                              value={course.name || ''}
                              onChange={(e) => {
                                const newCourses = [...formData.courses];
                                newCourses[index] = { ...course, name: e.target.value };
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                            />
                            <input
                              type="text"
                              placeholder="Course details"
                              value={course.details || ''}
                              onChange={(e) => {
                                const newCourses = [...formData.courses];
                                newCourses[index] = { ...course, details: e.target.value };
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                            />
                            <button
                              onClick={() => {
                                const newCourses = formData.courses.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, courses: newCourses });
                              }}
                              className="px-3 py-2 bg-[#8B5CF6] text-white rounded hover:bg-[#7C3AED] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, courses: [...(formData.courses || []), { name: '', details: '' }] })}
                          className="px-4 py-2 bg-[#60A5FA] text-white rounded hover:bg-[#3B82F6] transition-colors"
                        >
                          + Add Course
                        </button>
                      </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Requirements</h4>
                      <div className="space-y-2">
                        {formData.requirements?.map((req: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Requirement"
                              value={req}
                              onChange={(e) => {
                                const newReqs = [...formData.requirements];
                                newReqs[index] = e.target.value;
                                setFormData({ ...formData, requirements: newReqs });
                              }}
                              className="flex-1 px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                            />
                            <button
                              onClick={() => {
                                const newReqs = formData.requirements.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, requirements: newReqs });
                              }}
                              className="px-3 py-2 bg-[#8B5CF6] text-white rounded hover:bg-[#7C3AED] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setFormData({ ...formData, requirements: [...(formData.requirements || []), ''] })}
                          className="px-4 py-2 bg-[#60A5FA] text-white rounded hover:bg-[#3B82F6] transition-colors"
                        >
                          + Add Requirement
                        </button>
                      </div>
                    </div>

                    {/* Prices Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-dark-text border-b border-[#A8A8C8] dark:border-dark-border pb-2">Prices</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Undergraduate</label>
                          <input
                            type="text"
                            placeholder="Undergraduate price"
                            value={formData.prices?.undergraduate || ''}
                            onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, undergraduate: e.target.value } })}
                            className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">Graduate</label>
                          <input
                            type="text"
                            placeholder="Graduate price"
                            value={formData.prices?.graduate || ''}
                            onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, graduate: e.target.value } })}
                            className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => {
                        setUniversities(universities.map(u => u.id === selectedUniversity.id ? { ...u, details: formData, image: formData.image || selectedUniversity.image } : u));
                        setSelectedUniversity(null);
                      }}
                      className="w-full px-4 py-2 bg-[#60A5FA] text-white rounded-lg hover:bg-[#3B82F6] transition-colors"
                    >
                      Save Details
                    </button>
                  </div>
                </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-600 dark:text-dark-text-secondary">Select a university to edit details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
