import {useState} from 'react';

export function useToggleFeedback() {
  const [bouncing, setBouncing] = useState('');
  return {
    bouncing,
    trigger(key, action) {
      action();
      setBouncing(key);
    },
    clear() { setBouncing(''); }
  };
}
