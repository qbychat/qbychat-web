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
import { Button } from '../../../@/components/ui/button.tsx';
import { useNavigate } from 'react-router';

const IntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="grid place-items-center h-screen">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <h1 className="text-3xl">Welcome to QbyChat</h1>
        <p className="text-lg">Fast and secure, open-source that never tracks you</p>
        <div className="my-2"></div>
        <Button className="w-1/2" onClick={() => navigate('/onboarding/server')}>Let's Start</Button>
      </motion.div>
    </div>
  );
};


export default IntroPage;
