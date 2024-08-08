import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import moment from 'moment-timezone';
import { Context } from "../store/appContext";
import "../../styles/KitchenList.css";

export const KitchenList = () => {
  const { store, actions } = useContext(Context);
  const { restaurantId } = useParams();
  const [completedItems, setCompletedItems] = useState({});
  const [elapsedTimes, setElapsedTimes] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      actions.getPendingOrderList(restaurantId);
      console.log()
    }
  }, [restaurantId]);

  useEffect(() => {
    if (store.orders) {
      const initialCompletedItems = {};
      const initialElapsedTimes = {};

      store.orders.forEach((order) => {
        if (!completedItems[order.id]) {
          initialCompletedItems[order.id] = {};
          order.order_items.forEach((item) => {
            initialCompletedItems[order.id][item.id] = false;
          });
        }
        if (!elapsedTimes[order.id]) {
          const createdTime = moment.tz(order.created_at, "Europe/Madrid").valueOf();
          const currentTime = moment.tz(new Date(), "Europe/Madrid").valueOf();
          initialElapsedTimes[order.id] = Math.floor((currentTime - createdTime - 7200000) / 1000); // 7200000 ms = 2 hours
        }
      });

      setCompletedItems((prevCompletedItems) => ({ ...prevCompletedItems, ...initialCompletedItems }));
      setElapsedTimes((prevElapsedTimes) => ({ ...prevElapsedTimes, ...initialElapsedTimes }));
    }
  }, [store.orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes((prevElapsedTimes) => {
        const updatedElapsedTimes = { ...prevElapsedTimes };
        store.orders.forEach((order) => {
          updatedElapsedTimes[order.id] += 1;
        });
        return updatedElapsedTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [store.orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (restaurantId) {
        actions.getPendingOrderList(restaurantId);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [restaurantId, actions]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (timestamp) => {
    const date = moment.tz(timestamp, "Europe/Madrid").toDate();
    date.setHours(date.getHours() + 2);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date.toLocaleDateString(undefined, options);
  };

  const toggleItemCompleted = (orderId, itemId) => {
    setCompletedItems((prevCompletedItems) => ({
      ...prevCompletedItems,
      [orderId]: {
        ...prevCompletedItems[orderId],
        [itemId]: !prevCompletedItems[orderId][itemId],
      },
    }));
  };

  const toggleOrderCompleted = (orderId) => {
    const order = store.orders.find((order) => order.id === orderId);
    if (!order) return false;

    return order.order_items.every((item) => completedItems[orderId]?.[item.id]);
  };

  const handleDoneClick = (orderId) => {
    actions.removeOrderFromList(orderId);
    setCompletedItems((prevCompletedItems) => {
      const updatedCompletedItems = { ...prevCompletedItems };
      delete updatedCompletedItems[orderId];
      actions.updateOrderStatus(restaurantId, orderId);
      return updatedCompletedItems;
    });
    setElapsedTimes((prevElapsedTimes) => {
      const updatedElapsedTimes = { ...prevElapsedTimes };
      delete updatedElapsedTimes[orderId];
      return updatedElapsedTimes;
    });
    setExpandedOrder(null);
  };

  const toggleExpandOrder = (orderId, isHeaderClick) => {
    if (isHeaderClick) {
      setExpandedOrder((prevOrderId) => (prevOrderId === orderId ? null : orderId));
    } else {
      setExpandedOrder(orderId);
    }
  };

  return (
    <div className="kitchen-list">
      {store.orders.map((order) => {
        const isOrderCompleted = toggleOrderCompleted(order.id);
        const elapsedTime = elapsedTimes[order.id] || 0;
        const isOlderThanOneMinutes = elapsedTime > 600;

        const visibleItems = expandedOrder === order.id ? order.order_items : order.order_items.slice(0, 3);

        return (
          <div
            key={order.id}
            className={`order-container ${isOlderThanOneMinutes ? 'order-old' : ''} ${expandedOrder === order.id ? 'expanded' : ''}`}
            onClick={() => toggleExpandOrder(order.id, false)}
          >
            <div className='order-header' onClick={(e) => {
              e.stopPropagation();
              toggleExpandOrder(order.id, true);
            }}>
              <div className='order-header-up'>
                <p>
                  <b>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343">
                      <path d="M173-600h614l-34-120H208l-35 120Zm307-60Zm192 140H289l-11 80h404l-10-80ZM160-160l49-360h-89q-20 0-31.5-16T82-571l57-200q4-13 14-21t24-8h606q14 0 24 8t14 21l57 200q5 19-6.5 35T840-520h-88l48 360h-80l-27-200H267l-27 200h-80Z" />
                    </svg>
                    {order.table_id}
                  </b>
                </p>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343">
                    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                  </svg>
                  4
                </p>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                    <path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z" />
                  </svg>
                  {order.id}
                </p>
              </div>
              <div className='order-header-below'>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                    <path d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-280Z" />
                  </svg>

                </p>
                <p>{formatTime(elapsedTime)}</p>
              </div>
            </div>
            <p className='order-date'>{formatDateTime(order.created_at)}</p>
            <ul className="order-items-list">
              {visibleItems.map((item) => (
                <li key={item.id} className={`order-item ${completedItems[order.id]?.[item.id] ? 'completed' : ''}`}>
                  <div
                    className='name-quantity'
                    onClick={() => toggleItemCompleted(order.id, item.id)}
                  >
                    <span><b>{item.quantity}</b></span>
                    <span>{item.name}</span>
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={completedItems[order.id]?.[item.id] || false}
                      onChange={() => toggleItemCompleted(order.id, item.id)}
                    />
                  </label>
                </li>
              ))}
            </ul>
            {expandedOrder === order.id && (
              <div className='order-footer'>
                <button
                  className={`done-button ${isOrderCompleted ? 'done' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDoneClick(order.id);
                  }}
                  disabled={!isOrderCompleted}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#000000">
                    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

