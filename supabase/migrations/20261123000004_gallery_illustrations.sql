-- Adds the illustrative visuals (AI-generated, flagged is_illustration) and the mockup gallery order.
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('stage-dance', 'image', '/media/illus/stage-dance.webp', null, '/media/illus/stage-dance-sm.webp', '{"en":"Stage performance","fr":"Performance sur scène","ar":"عرض على المسرح","es":"Actuación en escenario"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Stage performance","fr":"Performance sur scène","ar":"عرض على المسرح","es":"Actuación en escenario"}'::jsonb, 'events', 1, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('class-zumba', 'image', '/media/illus/class-zumba.webp', null, '/media/illus/class-zumba-sm.webp', '{"en":"Zumba class energy","fr":"L’énergie d’un cours de Zumba","ar":"طاقة حصة زومبا","es":"La energía de una clase de Zumba"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Zumba class energy","fr":"L’énergie d’un cours de Zumba","ar":"طاقة حصة زومبا","es":"La energía de una clase de Zumba"}'::jsonb, 'zumba', 2, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('stage-veil', 'image', '/media/illus/stage-veil.webp', null, '/media/illus/stage-veil-sm.webp', '{"en":"Dance under the lights","fr":"Danse sous les projecteurs","ar":"رقص تحت الأضواء","es":"Danza bajo los focos"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Dance under the lights","fr":"Danse sous les projecteurs","ar":"رقص تحت الأضواء","es":"Danza bajo los focos"}'::jsonb, 'dance', 3, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('studio-fitness', 'image', '/media/illus/studio-fitness.webp', null, '/media/illus/studio-fitness-sm.webp', '{"en":"Studio training","fr":"Entraînement en studio","ar":"تدريب في الاستوديو","es":"Entrenamiento en estudio"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Studio training","fr":"Entraînement en studio","ar":"تدريب في الاستوديو","es":"Entrenamiento en estudio"}'::jsonb, 'fitness', 4, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('stage-group', 'image', '/media/illus/stage-group.webp', null, '/media/illus/stage-group-sm.webp', '{"en":"Show night","fr":"Soirée spectacle","ar":"ليلة العرض","es":"Noche de espectáculo"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Show night","fr":"Soirée spectacle","ar":"ليلة العرض","es":"Noche de espectáculo"}'::jsonb, 'events', 8, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('studio-class', 'image', '/media/illus/studio-class.webp', null, '/media/illus/studio-class-sm.webp', '{"en":"Group class","fr":"Cours collectif","ar":"حصة جماعية","es":"Clase en grupo"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Group class","fr":"Cours collectif","ar":"حصة جماعية","es":"Clase en grupo"}'::jsonb, 'zumba', 9, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('concert-crowd', 'image', '/media/illus/concert-crowd.webp', null, '/media/illus/concert-crowd-sm.webp', '{"en":"Event atmosphere","fr":"Ambiance d’événement","ar":"أجواء الفعالية","es":"Ambiente de evento"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Event atmosphere","fr":"Ambiance d’événement","ar":"أجواء الفعالية","es":"Ambiente de evento"}'::jsonb, 'events', 10, false, true, true) on conflict (id) do nothing;
insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values ('cabin-crew', 'image', '/media/illus/cabin-crew.webp', null, '/media/illus/cabin-crew-sm.webp', '{"en":"Cabin crew spirit","fr":"L’esprit personnel navigant","ar":"روح طاقم الضيافة","es":"Espíritu de tripulación"}'::jsonb, '{"en":"","fr":"","ar":"","es":""}'::jsonb, '{"en":"Cabin crew spirit","fr":"L’esprit personnel navigant","ar":"روح طاقم الضيافة","es":"Espíritu de tripulación"}'::jsonb, 'professional', 11, false, true, true) on conflict (id) do nothing;
update public.portfolio_items set sort_order = 5 where id = 'video-1';
update public.portfolio_items set sort_order = 6 where id = 'video-2';
update public.portfolio_items set sort_order = 7 where id = 'video-3';
update public.portfolio_items set sort_order = 12 where id = 'dance-1';
update public.portfolio_items set sort_order = 13 where id = 'dance-2';
update public.portfolio_items set sort_order = 14 where id = 'dance-3';
update public.portfolio_items set sort_order = 15 where id = 'dance-4';
update public.portfolio_items set sort_order = 16 where id = 'fitness-1';
update public.portfolio_items set sort_order = 17 where id = 'fitness-2';
update public.portfolio_items set sort_order = 18 where id = 'fitness-3';
update public.portfolio_items set sort_order = 19 where id = 'fitness-4';
update public.portfolio_items set sort_order = 20 where id = 'zumba-1';
update public.portfolio_items set sort_order = 21 where id = 'zumba-2';
update public.portfolio_items set sort_order = 22 where id = 'illustration-zumba';
update public.portfolio_items set sort_order = 23 where id = 'illustration-fitdance';
update public.portfolio_items set sort_order = 24 where id = 'illustration-dance-collage';
