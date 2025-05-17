/*
 * Copyright (c) 2025. All rights reserved.
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

import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: Props) => {
  return (
    <div className="mx-auto flex flex-col items-center justify-center pt-10 px-4 sm:px-6 lg:px-8 w-full max-w-xl">
      <img src="/qbychat.svg" alt="QbyChat Logo" className="size-50 mb-4"/>
      <h1 className="text-2xl lg:text-3xl font-semibold text-center">{title}</h1>
      {subtitle && (
        <p className="text-[#707579] dark:text-[#aaaaaa] text-center text-sm">
          {subtitle}
        </p>
      )}
      <div className="w-full mt-6">{children}</div>
    </div>
  );
};

export default AuthLayout;