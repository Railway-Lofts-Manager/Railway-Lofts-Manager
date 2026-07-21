import { useState } from 'react'

function App() {

  const [activePage, setActivePage] = useState('Dashboard')

  const menuItems = [

    'Dashboard',

    'Bird Register',

    'Breeding',

    'Training',

    'Racing',

    'Health',

    'Feeding',

    'Season Planner',

  ]

  const dashboardCards = [

    { title: 'Birds in Loft', value: '142', icon: '🐦' },

    { title: 'Young Birds', value: '38', icon: '🐣' },

    { title: 'Pairs Breeding', value: '25', icon: '🥚' },

    { title: 'Birds Under Treatment', value: '2', icon: '❤️' },

  ]

  return (

    <div style={styles.app}>

      <aside style={styles.sidebar}>

        <div style={styles.logoArea}>

          <div style={styles.trainIcon}>🚂</div>

          <h1 style={styles.logoTitle}>Railway Lofts</h1>

          <p style={styles.logoSubtitle}>Church Lane</p>

        </div>

        <nav style={styles.navigation}>

          {menuItems.map((item) => (

            <button

              key={item}

              onClick={() => setActivePage(item)}

              style={{

                ...styles.navButton,

                ...(activePage === item ? styles.navButtonActive : {}),

              }}

            >

              {item}

            </button>

          ))}

        </nav>

        <div style={styles.sidebarFooter}>

          Railway Lofts Manager

          <br />

          Version 1.0

        </div>

      </aside>

      <main style={styles.main}>

        <header style={styles.header}>

          <div>

            <p style={styles.welcome}>Welcome back, Shane</p>

            <h2 style={styles.pageTitle}>{activePage}</h2>

          </div>

          <div style={styles.dateBox}>

            <span style={styles.dateLabel}>Season</span>

            <strong>2027</strong>

          </div>

        </header>

        {activePage === 'Dashboard' ? (

          <>

            <section style={styles.cardGrid}>

              {dashboardCards.map((card) => (

                <article key={card.title} style={styles.card}>

                  <div style={styles.cardIcon}>{card.icon}</div>

                  <div>

                    <p style={styles.cardTitle}>{card.title}</p>

                    <p style={styles.cardValue}>{card.value}</p>

                  </div>

                </article>

              ))}

            </section>

            <section style={styles.contentGrid}>

              <article style={styles.panel}>

                <h3 style={styles.panelTitle}>Next Race</h3>

                <div style={styles.raceBox}>

                  <div>

                    <p style={styles.raceLocation}>Kingdown</p>

                    <p style={styles.mutedText}>Saturday</p>

                  </div>

                  <div style={styles.raceBadge}>🏁</div>

                </div>

                <button style={styles.primaryButton}>View Race Programme</button>

              </article>

              <article style={styles.panel}>

                <h3 style={styles.panelTitle}>Today’s Tasks</h3>

                <div style={styles.task}>✓ Check young bird drinkers</div>

                <div style={styles.task}>✓ Record morning feed</div>

                <div style={styles.task}>○ Check birds under treatment</div>

                <div style={styles.task}>○ Prepare evening exercise</div>

              </article>

              <article style={styles.panel}>

                <h3 style={styles.panelTitle}>Upcoming</h3>

                <div style={styles.upcomingRow}>

                  <span>💉 Vaccinations due</span>

                  <strong>4</strong>

                </div>

                <div style={styles.upcomingRow}>

                  <span>🥚 Eggs due to hatch</span>

                  <strong>11</strong>

                </div>

                <div style={styles.upcomingRow}>

                  <span>🚚 Next training toss</span>

                  <strong>Tuesday</strong>

                </div>

              </article>

            </section>

          </>

        ) : (

          <section style={styles.panel}>

            <h3 style={styles.panelTitle}>{activePage}</h3>

            <p style={styles.mutedText}>

              This section is ready for us to build next.

            </p>

          </section>

        )}

      </main>

    </div>

  )

}

const styles = {

  app: {

    display: 'flex',

    minHeight: '100vh',

    background: '#f2f5f1',

    color: '#17351f',

    fontFamily: 'Arial, Helvetica, sans-serif',

  },

  sidebar: {

    width: '250px',

    background: '#123c24',

    color: 'white',

    padding: '28px 18px',

    display: 'flex',

    flexDirection: 'column',

    boxSizing: 'border-box',

  },

  logoArea: {

    textAlign: 'center',

    borderBottom: '1px solid rgba(255,255,255,0.18)',

    paddingBottom: '24px',

    marginBottom: '24px',

  },

  trainIcon: {

    fontSize: '42px',

  },

  logoTitle: {

    margin: '8px 0 2px',

    fontSize: '25px',

  },

  logoSubtitle: {

    margin: 0,

    color: '#c9d9cd',

  },

  navigation: {

    display: 'flex',

    flexDirection: 'column',

    gap: '8px',

  },

  navButton: {

    border: 'none',

    borderRadius: '9px',

    background: 'transparent',

    color: '#e7f1e9',

    padding: '12px 14px',

    textAlign: 'left',

    fontSize: '15px',

    cursor: 'pointer',

  },

  navButtonActive: {

    background: '#d8a531',

    color: '#17351f',

    fontWeight: 'bold',

  },

  sidebarFooter: {

    marginTop: 'auto',

    paddingTop: '30px',

    color: '#afc4b4',

    fontSize: '12px',

    lineHeight: '1.6',

  },

  main: {

    flex: 1,

    padding: '32px',

    boxSizing: 'border-box',

  },

  header: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: '28px',

  },

  welcome: {

    margin: 0,

    color: '#718077',

    fontSize: '14px',

  },

  pageTitle: {

    margin: '5px 0 0',

    fontSize: '32px',

  },

  dateBox: {

    background: 'white',

    borderRadius: '12px',

    padding: '12px 20px',

    boxShadow: '0 4px 14px rgba(26, 58, 34, 0.08)',

    textAlign: 'center',

  },

  dateLabel: {

    display: 'block',

    color: '#718077',

    fontSize: '12px',

    marginBottom: '3px',

  },

  cardGrid: {

    display: 'grid',

    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',

    gap: '18px',

    marginBottom: '22px',

  },

  card: {

    background: 'white',

    borderRadius: '15px',

    padding: '22px',

    display: 'flex',

    gap: '16px',

    alignItems: 'center',

    boxShadow: '0 5px 18px rgba(26, 58, 34, 0.08)',

  },

  cardIcon: {

    width: '48px',

    height: '48px',

    borderRadius: '12px',

    background: '#e7f0e9',

    display: 'grid',

    placeItems: 'center',

    fontSize: '26px',

  },

  cardTitle: {

    margin: 0,

    color: '#718077',

    fontSize: '14px',

  },

  cardValue: {

    margin: '5px 0 0',

    fontWeight: 'bold',

    fontSize: '28px',

  },

  contentGrid: {

    display: 'grid',

    gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',

    gap: '18px',

  },

  panel: {

    background: 'white',

    borderRadius: '15px',

    padding: '24px',

    boxShadow: '0 5px 18px rgba(26, 58, 34, 0.08)',

  },

  panelTitle: {

    marginTop: 0,

    fontSize: '20px',

  },

  raceBox: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    background: '#edf4ee',

    padding: '17px',

    borderRadius: '12px',

    marginBottom: '17px',

  },

  raceLocation: {

    margin: 0,

    fontWeight: 'bold',

    fontSize: '22px',

  },

  raceBadge: {

    fontSize: '35px',

  },

  primaryButton: {

    width: '100%',

    border: 'none',

    borderRadius: '9px',

    background: '#d8a531',

    color: '#17351f',

    fontWeight: 'bold',

    padding: '12px',

    cursor: 'pointer',

  },

  task: {

    padding: '11px 0',

    borderBottom: '1px solid #e6ebe7',

    color: '#405548',

  },

  upcomingRow: {

    display: 'flex',

    justifyContent: 'space-between',

    gap: '20px',

    padding: '13px 0',

    borderBottom: '1px solid #e6ebe7',

  },

  mutedText: {

    color: '#718077',

    margin: '4px 0',

  },

}

export default App