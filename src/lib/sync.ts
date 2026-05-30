// src/lib/sync.ts

const PREFIX = 'linkfluence_';

// Store original methods to avoid infinite recursion
const originalSetItem = window.localStorage.setItem;
const originalRemoveItem = window.localStorage.removeItem;

// Overwrite window.localStorage.setItem
window.localStorage.setItem = function(key: string, value: string) {
  originalSetItem.apply(this, [key, value]);
  if (key.startsWith(PREFIX)) {
    fetch('/api/storage/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(err => {
      console.warn('Sync SET failed:', err);
    });
  }
};

// Overwrite window.localStorage.removeItem
window.localStorage.removeItem = function(key: string) {
  originalRemoveItem.apply(this, [key]);
  if (key.startsWith(PREFIX)) {
    fetch('/api/storage/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    }).catch(err => {
      console.warn('Sync REMOVE failed:', err);
    });
  }
};

// Sync startup and polling function
export async function syncFromGlobalStorage() {
  try {
    const res = await fetch('/api/storage/all');
    if (!res.ok) return;
    const data = await res.json();
    
    let hasUpdated = false;

    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(PREFIX)) {
        let valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        
        // Merge list mechanics for rosters to make sure any active rosters across instances don't override each other
        if (key === 'linkfluence_users_roster') {
          const localRosterStr = localStorage.getItem('linkfluence_users_roster');
          let localRoster: string[] = [];
          try {
            if (localRosterStr) localRoster = JSON.parse(localRosterStr);
          } catch(e) {}
          
          let serverRoster: string[] = [];
          try {
            serverRoster = JSON.parse(valueStr);
          } catch(e) {}
          
          const mergedRoster = Array.from(new Set([...localRoster, ...serverRoster]));
          const mergedStr = JSON.stringify(mergedRoster);
          if (localRosterStr !== mergedStr) {
            originalSetItem.call(localStorage, 'linkfluence_users_roster', mergedStr);
            hasUpdated = true;
          }
        } else {
          const localVal = localStorage.getItem(key);
          if (localVal !== valueStr) {
            originalSetItem.call(localStorage, key, valueStr);
            hasUpdated = true;
          }
        }
      }
    });

    if (hasUpdated) {
      window.dispatchEvent(new CustomEvent('linkfluence_data_updated', { detail: { email: '*' } }));
    }
  } catch (err) {
    console.error('Error in global sync on startup:', err);
  }
}

// Automatically execute on import
syncFromGlobalStorage();

// Poll for changes every 10 seconds to keep the admin panel & other users live
setInterval(() => {
  syncFromGlobalStorage();
}, 10000);
