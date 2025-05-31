/*
 *  Copyright (c) 2025. All rights reserved.
 *  This file is a part of the QbyChat project
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useOnboardingStore } from '@/stores/router/onboarding-router-store.ts';
import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';

export const WelcomePage = () => {
  const { t } = useTranslation();
  const navigate = useOnboardingStore(state => state.navigate);

  return (
    <div className="h-full w-full flex flex-col gap-6 items-center justify-center px-4 text-center">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
        {t('onboarding.welcome.title')}
      </h1>
      <Button
        color="primary"
        radius="full"
        size="lg"
        onClick={() => navigate('setupServer')}
      >
        {t('onboarding.welcome.go')}
      </Button>
    </div>
  );
};
