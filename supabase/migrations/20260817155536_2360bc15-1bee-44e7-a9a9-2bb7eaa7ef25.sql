
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Own avatar upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Own avatar update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Own avatar delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read review photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'review-photos');
CREATE POLICY "Own review photo upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Own review photo delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
