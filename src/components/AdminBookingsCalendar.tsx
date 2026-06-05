import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { Calendar, ChevronLeft, ChevronRight, BedDouble, User, CreditCard, Clock, ShieldCheck } from 'lucide-react';
import { Booking } from '@/types';

interface AdminBookingsCalendarProps {
  bookings: Booking[];
  onSelectBookingStatus?: (status: string) => void;
}

interface CalendarCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  bookings: Booking[];
}

export function AdminBookingsCalendar({ bookings }: AdminBookingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Generate calendar days for a standard Sun-Sat grid
  const daysInMonth: CalendarCell[] = [];
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Calculate grid start position (backing up to Sunday of the first week)
  const gridStart = new Date(year, month, 1 - startDayOfWeek);

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const cellTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()).getTime();

    // Filter bookings active on this date: check_in <= cellDate <= check_out
    const activeBookings = bookings.filter(b => {
      if (b.booking_status === 'Cancelled') return false;
      const checkInDate = parseLocalDate(b.check_in);
      const checkOutDate = parseLocalDate(b.check_out);
      
      const checkInTime = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate()).getTime();
      const checkOutTime = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate()).getTime();

      return cellTime >= checkInTime && cellTime <= checkOutTime;
    });

    daysInMonth.push({
      date: cellDate,
      dayOfMonth: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month,
      bookings: activeBookings,
    });
  }

  // Pre-select today's cell on load if current month/year matches today
  useEffect(() => {
    const today = new Date();
    const todayCell = daysInMonth.find(cell => 
      cell.date.getDate() === today.getDate() && 
      cell.date.getMonth() === today.getMonth() && 
      cell.date.getFullYear() === today.getFullYear()
    );
    if (todayCell) {
      setSelectedCell(todayCell);
    } else {
      // Otherwise select the first day of the currently displayed month
      const firstOfMonthCell = daysInMonth.find(cell => cell.isCurrentMonth && cell.dayOfMonth === 1);
      if (firstOfMonthCell) {
        setSelectedCell(firstOfMonthCell);
      }
    }
  }, [currentDate]);

  // Render SVG Calendar Grid with D3
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous elements
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const margin = { top: 20, right: 10, bottom: 10, left: 10 };
    const width = 580;
    const height = 400;
    const cellSize = Math.floor((width - margin.left - margin.right) / 7);
    const cellHeight = Math.floor((height - margin.top - margin.bottom) / 6);

    const g = svgElement
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Render Weekday Headers (Su, Mo, Tu, We, Th, Fr, Sa)
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    g.selectAll('.weekday-label')
      .data(weekdays)
      .enter()
      .append('text')
      .attr('class', 'weekday-label')
      .attr('x', (_, i) => i * cellSize + cellSize / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('font-family', 'var(--font-sans), system-ui, sans-serif')
      .attr('fill', '#A1A1AA') // zinc-400
      .attr('letter-spacing', '0.05em')
      .text(d => d.toUpperCase());

    // Scale for coloring cells based on active booking density
    const maxDensity = Math.max(1, d3.max(daysInMonth, d => d.bookings.length) || 1);
    
    // Custom color interpolation from very dark zinc/black -> glowing Neon (#CCFF00)
    // 0 bookings: #09090b (black/zinc-950)
    // 1 booking: #122100 (deep green-yellow)
    // 2-3 bookings: #2d4c00 (medium green-yellow)
    // 4+ bookings: #CCFF00 (bright Neon)
    const colorScale = d3.scaleThreshold<number, string>()
      .domain([1, 2, 4])
      .range(['#18181B', '#1e2c14', '#38561d', '#CCFF00']);

    // Render Grid Cells
    const cellGroups = g.selectAll('.calendar-cell')
      .data(daysInMonth)
      .enter()
      .append('g')
      .attr('class', 'calendar-cell')
      .attr('transform', (_, i) => {
        const x = (i % 7) * cellSize;
        const y = Math.floor(i / 7) * cellHeight;
        return `translate(${x},${y})`;
      })
      .style('cursor', 'pointer');

    // Draw cell rectangles
    cellGroups.append('rect')
      .attr('width', cellSize - 4)
      .attr('height', cellHeight - 4)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        if (!d.isCurrentMonth) return '#09090B'; // Out of month
        return d.bookings.length === 0 ? '#18181B' : colorScale(d.bookings.length);
      })
      .attr('fill-opacity', d => d.isCurrentMonth ? 1 : 0.4)
      .attr('stroke', d => {
        // Highlight selected cell
        if (selectedCell && 
            d.date.getDate() === selectedCell.date.getDate() && 
            d.date.getMonth() === selectedCell.date.getMonth() && 
            d.date.getFullYear() === selectedCell.date.getFullYear()) {
          return '#CCFF00';
        }
        return '#27272A'; // zinc-800
      })
      .attr('stroke-width', d => {
        if (selectedCell && 
            d.date.getDate() === selectedCell.date.getDate() && 
            d.date.getMonth() === selectedCell.date.getMonth() && 
            d.date.getFullYear() === selectedCell.date.getFullYear()) {
          return 2;
        }
        return 1;
      })
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function(_, d) {
        d3.select(this)
          .attr('stroke', '#CCFF00')
          .attr('stroke-width', 2);
      })
      .on('mouseout', function(_, d) {
        // Restore standard stroke unless selected
        const isSelected = selectedCell && 
          d.date.getDate() === selectedCell.date.getDate() && 
          d.date.getMonth() === selectedCell.date.getMonth() && 
          d.date.getFullYear() === selectedCell.date.getFullYear();
          
        d3.select(this)
          .attr('stroke', isSelected ? '#CCFF00' : '#27272A')
          .attr('stroke-width', isSelected ? 2 : 1);
      })
      .on('click', (_, d) => {
        setSelectedCell(d);
      });

    // Draw date numbers
    cellGroups.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '12px')
      .attr('font-weight', '900')
      .attr('font-family', 'var(--font-mono), monospace')
      .attr('fill', d => {
        if (d.bookings.length >= 4 && d.isCurrentMonth) return '#000000'; // dark text on bright neon
        return d.isCurrentMonth ? '#FFFFFF' : '#3F3F46'; // dim out of month
      })
      .text(d => d.dayOfMonth);

    // Draw small green indicator circle or counters for active reservations
    cellGroups.filter(d => d.bookings.length > 0)
      .append('rect')
      .attr('x', cellSize - 22)
      .attr('y', 8)
      .attr('width', 14)
      .attr('height', 14)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', d => d.bookings.length >= 4 ? '#000000' : '#CCFF00')
      .attr('fill-opacity', 0.9);

    cellGroups.filter(d => d.bookings.length > 0)
      .append('text')
      .attr('x', cellSize - 15)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', '900')
      .attr('font-family', 'var(--font-mono), monospace')
      .attr('fill', d => d.bookings.length >= 4 ? '#CCFF00' : '#000000')
      .text(d => d.bookings.length);

  }, [currentDate, bookings, selectedCell]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      {/* Calendar D3 Panel */}
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Calendar className="text-[#CCFF00]" size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100 font-sans">
              Stay Matrix Timeline
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black uppercase tracking-wider font-mono text-white px-2">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
          <span>Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-[#18181B] border border-zinc-800 inline-block"></span>
            <span>0 Stay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-[#1e2c14] inline-block"></span>
            <span>1 stay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-[#38561d] inline-block"></span>
            <span>2-3</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-[#CCFF00] inline-block"></span>
            <span>4+ peak</span>
          </div>
        </div>

        {/* D3 Svg element */}
        <div className="w-full h-auto overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full select-none"
            style={{ minHeight: '320px' }}
          />
        </div>
      </div>

      {/* Date Inspection Panel */}
      <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl flex flex-col h-full">
        <div className="mb-4 pb-2 border-b border-zinc-900 flex justify-between items-baseline">
          <div>
            <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">Selected Date</p>
            <h3 className="text-lg font-black text-white font-sans mt-0.5">
              {selectedCell 
                ? selectedCell.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                : 'No Date Selected'
              }
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-[#CCFF00]">
            {selectedCell ? selectedCell.bookings.length : 0} Active Stay{selectedCell?.bookings.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[340px] space-y-3.5 pr-1">
          <AnimatePresence mode="popLayout">
            {selectedCell && selectedCell.bookings.length > 0 ? (
              selectedCell.bookings.map((b) => (
                <motion.div
                  key={b.booking_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-4 transition-all duration-200"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-[#CCFF00]" />
                        <span className="text-xs font-black text-white font-sans uppercase">
                          {b.customer_name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase block mt-0.5">
                        Lobby Suite #{b.room_number || 'N/A'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase rounded border ${
                      b.booking_status === 'Confirmed' 
                        ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' 
                        : 'bg-amber-950/40 border-amber-900 text-amber-400'
                    }`}>
                      {b.booking_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-900 text-[10px] text-zinc-400 font-mono">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Check-In</span>
                      <span className="text-zinc-300 font-bold">{b.check_in}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Check-Out</span>
                      <span className="text-zinc-300 font-bold">{b.check_out}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 text-[10px] border-t border-zinc-900 bg-black/20 px-2 py-1.5 rounded-lg border border-zinc-900/50">
                    <span className="text-zinc-500 font-mono">Booking Ref ID:</span>
                    <span className="text-[#CCFF00] font-mono font-extrabold">#HB-{b.booking_id}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-900 rounded-2xl h-full">
                <BedDouble size={28} className="text-zinc-700 mb-2.5" />
                <p className="text-xs font-sans font-bold text-zinc-400">Quiet Day Ahead</p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-mono">No reservations active on this date</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
