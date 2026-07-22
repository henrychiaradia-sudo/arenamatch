'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AthleteProfileForm } from '@/features/profile/athlete-profile-form';
import { AchievementsEditor, type AchievementItem } from '@/features/profile/achievements-editor';
import { BenefitsSelector } from '@/features/profile/benefits-selector';
import { SocialAccountsEditor, type SocialItem } from '@/features/profile/social-accounts-editor';
import { SponsorshipNeedsEditor, type NeedItem } from '@/features/profile/sponsorship-needs-editor';
import type { AthleteProfileInput } from '@/schemas/profile';

interface Props {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  defaults: AthleteProfileInput;
  achievements: AchievementItem[];
  socials: SocialItem[];
  selectedBenefits: string[];
  needs: NeedItem[];
}

export function AthleteProfileEditor(props: Props) {
  return (
    <Tabs defaultValue="dados">
      <TabsList className="flex-wrap">
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
        <TabsTrigger value="contrapartidas">Contrapartidas</TabsTrigger>
        <TabsTrigger value="redes">Redes</TabsTrigger>
        <TabsTrigger value="necessidades">Necessidades</TabsTrigger>
      </TabsList>

      <TabsContent value="dados" className="mt-6">
        <AthleteProfileForm
          userId={props.userId}
          fullName={props.fullName}
          avatarUrl={props.avatarUrl}
          coverUrl={props.coverUrl}
          defaults={props.defaults}
        />
      </TabsContent>
      <TabsContent value="conquistas" className="mt-6">
        <AchievementsEditor items={props.achievements} />
      </TabsContent>
      <TabsContent value="contrapartidas" className="mt-6">
        <BenefitsSelector selected={props.selectedBenefits} />
      </TabsContent>
      <TabsContent value="redes" className="mt-6">
        <SocialAccountsEditor items={props.socials} />
      </TabsContent>
      <TabsContent value="necessidades" className="mt-6">
        <SponsorshipNeedsEditor items={props.needs} />
      </TabsContent>
    </Tabs>
  );
}
