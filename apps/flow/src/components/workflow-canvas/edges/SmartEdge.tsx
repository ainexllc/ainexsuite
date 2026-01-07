'use client';

import { memo, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getEdgeCenter,
  type EdgeProps,
} from '@xyflow/react';

const OFFSET = 40;

type SmartEdgeProps = EdgeProps;

const buildSmartPath = (props: SmartEdgeProps) => {
  const { sourceX, sourceY, targetX, targetY } = props;
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const horizontalFirst = Math.abs(deltaX) > Math.abs(deltaY);
  const horizontalOffset = OFFSET * Math.sign(deltaX || 1);
  const verticalOffset = OFFSET * Math.sign(deltaY || 1);

  const points = [{ x: sourceX, y: sourceY }];

  if (horizontalFirst) {
    points.push({ x: sourceX + horizontalOffset, y: sourceY });
    points.push({ x: sourceX + horizontalOffset, y: targetY - verticalOffset });
  } else {
    points.push({ x: sourceX, y: sourceY + verticalOffset });
    points.push({ x: targetX - horizontalOffset, y: sourceY + verticalOffset });
  }

  points.push({ x: targetX, y: targetY });

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
};

function SmartEdgeComponent(props: SmartEdgeProps) {
  const {
    id,
    markerStart,
    markerEnd,
    selected,
    label,
    labelStyle,
    labelBgStyle,
    labelBgBorderRadius,
    labelBgPadding,
    labelShowBg,
    interactionWidth,
    style,
  } = props;

  const path = useMemo(() => buildSmartPath(props), [props]);
  const [labelX, labelY] = getEdgeCenter(props);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerStart={markerStart}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth ?? 30}
        style={style}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              pointerEvents: 'all',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                background: labelShowBg ? labelBgStyle?.background ?? 'rgba(0,0,0,0.6)' : 'transparent',
                borderRadius: labelBgBorderRadius ?? 6,
                padding: labelBgPadding
                  ? `${labelBgPadding[1]}px ${labelBgPadding[0]}px`
                  : '4px 8px',
                ...labelBgStyle,
              }}
              className={`text-xs text-white ${selected ? 'font-semibold' : ''}`}
            >
              <span style={labelStyle}>{label}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const SmartEdge = memo(SmartEdgeComponent);
