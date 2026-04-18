import { useParams, useNavigate } from 'react-router-dom';
import { getTeamColor } from '../api/images';
import { getRaceResults } from '../api/f1api';


export default function RaceResultsPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getRaceResults(raceId)
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching race results:', err);
        setError('Failed to load race results');
        setLoading(false);
      });
  }, [raceId]);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#060606',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: "'Formula1', sans-serif",
        fontSize: '20px'
      }}>
        Loading race results...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#060606',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: "'Formula1', sans-serif"
      }}>
        <div style={{ color: '#ffffffff', fontSize: '24px', marginBottom: '16px' }}>Error</div>
        <div style={{ fontSize: '16px', marginBottom: '24px' }}>{error}</div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: "'Formula1', sans-serif",
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#e2e2e2ff';
            e.currentTarget.style.background = 'rgba(228, 0, 43, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#060606',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '80px',
        background: '#0a0a0a',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'Formula1', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#E4002B';
              e.currentTarget.style.background = 'rgba(228, 0, 43, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            ← BACK
          </button>
          <div style={{
            width: '2px',
            height: '32px',
            background: '#E4002B',
            transition: 'background 0.4s',
          }} />
          <span style={{
            fontFamily: "'Formula1', sans-serif",
            fontWeight: 900,
            fontSize: '24px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '3px',
          }}>
            Race <span style={{ color: '#E4002B' }}>Results</span>
          </span>
        </div>

        {/* Race title */}
        <div style={{
          fontFamily: "'Formula1', sans-serif",
          fontWeight: 700,
          fontSize: '18px',
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          {results[0]?.raceName || 'Race Results'}
        </div>

        <div style={{ width: '140px' }} />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 40px',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          background: '#0a0a0a',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 80px 2fr 2fr 80px 80px 150px 80px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '16px 24px',
            fontWeight: 700,
            fontSize: '12px',
            color: '#faf7f8ff',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontFamily: "'Formula1', sans-serif"
          }}>
            <div>Pos</div>
            <div>No</div>
            <div>Driver</div>
            <div>Constructor</div>
            <div>Grid</div>
            <div>Laps</div>
            <div>Time/Status</div>
            <div style={{ textAlign: 'right' }}>Points</div>
          </div>

          {/* Results rows */}
          {results.map((res, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '80px 80px 2fr 2fr 80px 80px 150px 80px',
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              fontSize: '14px',
              color: '#fff',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <div style={{ fontWeight: 700, color: res.position === '1' ? '#ffffffff' : '#fff' }}>{res.position}</div>
              <div style={{ color: '#8591a3' }}>{res.number}</div>
              <div style={{ fontWeight: 700 }}>{res.driverName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '16px', background: getTeamColor(res.constructorId) }} />
                {res.constructorName}
              </div>
              <div style={{ color: '#8591a3' }}>{res.grid}</div>
              <div>{res.laps}</div>
              <div style={{ fontSize: '12px' }}>{res.time || res.status}</div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#f5f5f5ff' }}>{res.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
