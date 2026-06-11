import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';

function TestModal({ onClose }: { onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  return (
    <div
      data-testid="panel"
      onAnimationEnd={(e) => {
        console.log('React onAnimationEnd fired!', e.animationName, e.type);
        onClose();
      }}
    >
      <button onClick={() => setIsClosing(true)}>Close</button>
    </div>
  );
}

describe('animation end debug', () => {
  it('fires onAnimationEnd', () => {
    const onClose = vi.fn();
    const { container } = render(<TestModal onClose={onClose} />);
    
    let containerHandlerCalled = false;
    let bubbledToContainer = false;
    container.addEventListener('animationend', () => { 
      console.log('Container bubble listener fired');
      bubbledToContainer = true; 
    });
    container.addEventListener('animationend', () => { 
      console.log('Container capture listener fired');
      containerHandlerCalled = true; 
    }, true);
    
    const panel = screen.getByTestId('panel');
    
    // Test with bubbles:true
    fireEvent.animationEnd(panel, { bubbles: true });
    console.log('bubbledToContainer:', bubbledToContainer);
    console.log('containerHandlerCalled:', containerHandlerCalled);
    
    expect(onClose).toHaveBeenCalledOnce();
  });
});
