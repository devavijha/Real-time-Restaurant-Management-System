import { v4 as uuidv4 } from 'uuid';

type EventCallback<T> = (data: T) => void;
type Unsubscribe = () => void;

interface WebSocketEvent<T> {
  id: string;
  topic: string;
  callback: EventCallback<T>;
}

// Store all active subscriptions
const subscribers: WebSocketEvent<any>[] = [];

// Simulate WebSocket connection and events
export function simulateWebSocket<T>(topic: string, callback: EventCallback<T>): Unsubscribe {
  const subscriptionId = uuidv4();
  
  // Register the subscriber
  subscribers.push({
    id: subscriptionId,
    topic,
    callback
  });
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.findIndex(sub => sub.id === subscriptionId);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
}

export function broadcastEvent<T>(topic: string, data: T): void {
  // Find all subscribers for this topic
  const topicSubscribers = subscribers.filter(sub => sub.topic === topic);
  
  // Notify all subscribers
  topicSubscribers.forEach(sub => {
    // Add a small delay to simulate network latency
    setTimeout(() => {
      sub.callback(data);
    }, Math.random() * 200);
  });
}