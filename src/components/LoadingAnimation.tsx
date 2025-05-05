/*
 * Copyright (c) 2025. All rights reserved.
 *
 * This file is a part of the QbyChat project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <motion.div
      className="select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: '1.5rem',
        background: 'linear-gradient(-45deg, #1e3c72, #2a5298, #1e3c72)',
        backgroundSize: '600% 600%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      Loading QbyChat...
    </motion.div>
  );
}