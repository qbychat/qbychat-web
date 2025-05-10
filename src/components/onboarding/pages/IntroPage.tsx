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

import ColourfulText from '@/components/ui/colourful-text.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const IntroPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black px-4">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-white z-10 font-sans drop-shadow-xl">
        <Trans
          i18nKey="onboarding.intro.welcome"
          values={{ appName: 'qbychat' }}
          components={{ colorful: <ColourfulText text="qbychat" /> }}
        />
      </h1>

      <p className="mt-3 text-1xl lg:text-2xl md:text-2xl">{t('onboarding.intro.description')}</p>

      <div className="mt-6 z-10">
        <Button className="text-lg px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => navigate('/onboarding/server')}>
          {t('onboarding.intro.start')}
        </Button>
      </div>
    </div>
  );
};


export default IntroPage;
