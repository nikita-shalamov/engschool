import getData from "@/services/user/getData.service";
import { useQuery } from "@tanstack/react-query";

const useUserProfileData = (userId: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userProfileData", userId],
    queryFn: () => getData(userId),
    enabled: !!userId,
    select: (data: {
      user: {
        name: string;
        image: null | string;
        phoneNumber: string;
        id: number;
      };
    }) => data.user,
    staleTime: 300000,
  });

  return { data, isLoading, isError };
};

export default useUserProfileData;
